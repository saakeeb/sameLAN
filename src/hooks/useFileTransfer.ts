import { useState, useEffect, useRef, useCallback } from 'react';
import type { DataConnection } from 'peerjs';
import type { TransferItemState, WebRTCMessage, FileMetadata } from '../types';
import { getNumberOfChunks, getFileChunk, assembleFile } from '../utils/fileChunking';

export const useFileTransfer = (
  conns: DataConnection[],
  addLog: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void
) => {
  const [transfers, setTransfers] = useState<TransferItemState[]>([]);
  const receivedChunksRef = useRef<{ [fileId: string]: ArrayBuffer[] }>({});
  const startTimesRef = useRef<{ [fileId: string]: number }>({});

  // ─── Send a single file to all connected peers ──────────────────────────
  const sendFile = useCallback(
    async (file: File) => {
      const openConns = conns.filter((c) => c.open);
      if (openConns.length === 0) return;

      const fileId = Math.random().toString(36).substring(2, 9);
      const totalChunks = getNumberOfChunks(file.size);

      const newItem: TransferItemState = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
        direction: 'send',
        speed: 0,
      };

      setTransfers((prev) => [newItem, ...prev]);
      addLog('info', `Sending: ${file.name} → ${openConns.length} peer(s)`);

      try {
        setTransfers((prev) =>
          prev.map((t) => (t.id === fileId ? { ...t, status: 'transferring' } : t))
        );

        const headerMsg: WebRTCMessage = {
          type: 'file-header',
          payload: { id: fileId, name: file.name, size: file.size, type: file.type, totalChunks },
        };
        openConns.forEach((c) => c.send(headerMsg));

        const startTime = Date.now();
        let bytesSent = 0;

        for (let i = 0; i < totalChunks; i++) {
          // Ensure connection is still alive
          const alive = conns.filter((c) => c.open);
          if (alive.length === 0) throw new Error('Connection lost during transfer');

          const chunk = await getFileChunk(file, i);

          // Backpressure on first conn
          const dc = alive[0].dataChannel;
          if (dc && dc.bufferedAmount > 512 * 1024) {
            while (dc.bufferedAmount > 256 * 1024) {
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
          }

          const chunkMsg: WebRTCMessage = {
            type: 'file-chunk',
            payload: { fileId, chunkIndex: i, chunk },
          };
          alive.forEach((c) => c.send(chunkMsg));

          bytesSent += chunk.byteLength;
          const progress = Math.min(100, ((i + 1) / totalChunks) * 100);
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = bytesSent / Math.max(elapsed, 0.1);

          setTransfers((prev) =>
            prev.map((t) =>
              t.id === fileId
                ? { ...t, progress, speed, status: progress === 100 ? 'completed' : 'transferring' }
                : t
            )
          );
        }

        const completeMsg: WebRTCMessage = { type: 'file-complete', payload: { fileId } };
        conns.filter((c) => c.open).forEach((c) => c.send(completeMsg));
        addLog('success', `Sent: ${file.name}`);
      } catch (err: any) {
        console.error('Send file error:', err);
        addLog('error', `Failed: ${file.name}: ${err.message || err}`);
        setTransfers((prev) =>
          prev.map((t) => (t.id === fileId ? { ...t, status: 'error', error: err.message } : t))
        );
        const errMsg = { type: 'file-error', payload: { fileId, error: err.message } };
        conns.filter((c) => c.open).forEach((c) => c.send(errMsg));
      }
    },
    [conns, addLog]
  );

  const sendFiles = useCallback(
    async (filesList: File[] | FileList) => {
      const files = Array.from(filesList);
      for (const file of files) await sendFile(file);
    },
    [sendFile]
  );

  // ─── Listen for incoming file packets on all connections ────────────────
  useEffect(() => {
    if (conns.length === 0) {
      setTransfers([]);
      receivedChunksRef.current = {};
      startTimesRef.current = {};
      return;
    }

    const handlers: Array<[DataConnection, (d: unknown) => void]> = [];

    const handleData = (data: unknown) => {
      const packet = data as WebRTCMessage;
      if (!packet) return;

      switch (packet.type) {
        case 'file-header': {
          const { id, name, size, type, totalChunks } = packet.payload as FileMetadata;
          addLog('info', `Receiving: ${name} (${totalChunks} chunks)`);
          receivedChunksRef.current[id] = new Array(totalChunks);
          startTimesRef.current[id] = Date.now();
          const newItem: TransferItemState = {
            id, name, size, type,
            progress: 0, status: 'transferring', direction: 'receive', speed: 0,
            chunksReceived: 0, totalChunks,
          };
          setTransfers((prev) => {
            if (prev.find((t) => t.id === id)) return prev;
            return [newItem, ...prev];
          });
          break;
        }

        case 'file-chunk': {
          const { fileId, chunkIndex, chunk } = packet.payload;
          const chunks = receivedChunksRef.current[fileId];
          if (!chunks) return;
          chunks[chunkIndex] = chunk;
          const receivedCount = chunks.filter((c) => c !== undefined).length;
          const bytesReceived = chunks.reduce((acc, c) => acc + (c ? c.byteLength : 0), 0);
          const elapsed = (Date.now() - (startTimesRef.current[fileId] || Date.now())) / 1000;
          const speed = bytesReceived / Math.max(elapsed, 0.1);
          setTransfers((prev) =>
            prev.map((t) => {
              if (t.id !== fileId) return t;
              const total = t.totalChunks || 1;
              return { ...t, progress: Math.min(100, (receivedCount / total) * 100), speed, chunksReceived: receivedCount };
            })
          );
          break;
        }

        case 'file-complete': {
          const { fileId } = packet.payload;
          const chunks = receivedChunksRef.current[fileId];
          if (!chunks) return;
          setTransfers((prev) =>
            prev.map((t) => {
              if (t.id !== fileId) return t;
              const blob = assembleFile(chunks, t.type);
              const blobUrl = URL.createObjectURL(blob);
              addLog('success', `Received: ${t.name}`);
              return { ...t, progress: 100, status: 'completed', blobUrl };
            })
          );
          delete receivedChunksRef.current[fileId];
          delete startTimesRef.current[fileId];
          break;
        }

        case 'file-error': {
          const { fileId, error } = packet.payload;
          addLog('error', `Transfer error: ${error}`);
          setTransfers((prev) =>
            prev.map((t) => (t.id === fileId ? { ...t, status: 'error', error } : t))
          );
          delete receivedChunksRef.current[fileId];
          delete startTimesRef.current[fileId];
          break;
        }
      }
    };

    conns.forEach((conn) => {
      conn.on('data', handleData);
      handlers.push([conn, handleData]);
    });

    return () => {
      handlers.forEach(([conn, handler]) => conn.off('data', handler));
    };
  }, [conns, addLog]);

  return { transfers, sendFiles };
};

export default useFileTransfer;
