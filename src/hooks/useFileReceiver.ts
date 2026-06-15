import { useEffect, useRef, useState, useCallback } from 'react';
import type { DataConnection } from 'peerjs';
import type { TransferItemState, WebRTCMessage, FileMetadata } from '../types';
import { assembleFile } from '../utils/fileChunking';

type LogFn = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: string
) => void;

/**
 * Subscribes to incoming file packets on every open DataConnection, reassembles
 * the chunks into a Blob, and exposes a unified transfer list. The component
 * layer is responsible for rendering the list and the download links.
 */
export const useFileReceiver = (conns: DataConnection[], addLog: LogFn) => {
  const [transfers, setTransfers] = useState<TransferItemState[]>([]);
  const receivedChunksRef = useRef<{ [fileId: string]: ArrayBuffer[] }>({});
  const startTimesRef = useRef<{ [fileId: string]: number }>({});

  // Reset the receive buffers when there are no peers to listen to.
  useEffect(() => {
    if (conns.length === 0) {
      setTransfers([]);
      receivedChunksRef.current = {};
      startTimesRef.current = {};
    }
  }, [conns.length]);

  // Subscribe to data events on every connection.
  useEffect(() => {
    const handleData = (data: unknown) => {
      const packet = data as WebRTCMessage;
      if (!packet) return;

      switch (packet.type) {
        case 'file-header': {
          const { id, name, size, type, totalChunks } = packet.payload as FileMetadata;
          addLog('info', `Receiving: ${name} (${totalChunks} chunks)`);
          receivedChunksRef.current[id] = new Array(totalChunks);
          startTimesRef.current[id] = Date.now();
          setTransfers((prev) => {
            if (prev.find((t) => t.id === id)) return prev;
            const newItem: TransferItemState = {
              id,
              name,
              size,
              type,
              progress: 0,
              status: 'transferring',
              direction: 'receive',
              speed: 0,
              chunksReceived: 0,
              totalChunks,
            };
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
              return {
                ...t,
                progress: Math.min(100, (receivedCount / total) * 100),
                speed,
                chunksReceived: receivedCount,
              };
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

    const handlers: Array<[DataConnection, (d: unknown) => void]> = [];
    conns.forEach((conn) => {
      conn.on('data', handleData);
      handlers.push([conn, handleData]);
    });

    return () => {
      handlers.forEach(([conn, handler]) => conn.off('data', handler));
    };
  }, [conns, addLog]);

  /**
   * Push a brand-new transfer onto the list. The sender uses this when it
   * kicks off a new outgoing transfer; the receive effect uses setTransfers
   * directly because it needs the `prev` snapshot.
   */
  const pushTransfer = useCallback((item: TransferItemState) => {
    setTransfers((prev) => [item, ...prev]);
  }, []);

  /**
   * Patch a single transfer in place. Used by the sender to mark
   * progress/completion/error without forcing it to know about the receiver's
   * setTransfers internals.
   */
  const updateTransfer = useCallback((id: string, patch: Partial<TransferItemState>) => {
    setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  return { transfers, pushTransfer, updateTransfer };
};

export default useFileReceiver;
