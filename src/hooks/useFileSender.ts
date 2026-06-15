import { useCallback } from 'react';
import type { DataConnection } from 'peerjs';
import type { TransferItemState, WebRTCMessage } from '../types';
import { getNumberOfChunks, getFileChunk } from '../utils/fileChunking';

type LogFn = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: string
) => void;

interface UseFileSenderOptions {
  conns: DataConnection[];
  addLog: LogFn;
  /** Appends a new transfer (or returns the previous value via the callback). */
  pushTransfer: (item: TransferItemState) => void;
  /** Updates a single transfer by id with a partial state patch. */
  updateTransfer: (id: string, patch: Partial<TransferItemState>) => void;
}

/**
 * Owns the outbound file pipeline: slicing a File into chunks, broadcasting the
 * header/chunk/complete packets to all open connections, and reporting
 * progress. Extracted from useFileTransfer so the receiver logic can evolve
 * independently.
 */
export const useFileSender = ({
  conns,
  addLog,
  pushTransfer,
  updateTransfer,
}: UseFileSenderOptions) => {
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
      pushTransfer(newItem);
      addLog('info', `Sending: ${file.name} → ${openConns.length} peer(s)`);

      try {
        updateTransfer(fileId, { status: 'transferring' });

        const headerMsg: WebRTCMessage = {
          type: 'file-header',
          payload: { id: fileId, name: file.name, size: file.size, type: file.type, totalChunks },
        };
        openConns.forEach((c) => c.send(headerMsg));

        const startTime = Date.now();
        let bytesSent = 0;

        for (let i = 0; i < totalChunks; i++) {
          const alive = conns.filter((c) => c.open);
          if (alive.length === 0) throw new Error('Connection lost during transfer');

          const chunk = await getFileChunk(file, i);

          // Backpressure: wait for the data channel to drain before sending more.
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

          updateTransfer(fileId, {
            progress,
            speed,
            status: progress === 100 ? 'completed' : 'transferring',
          });
        }

        const completeMsg: WebRTCMessage = { type: 'file-complete', payload: { fileId } };
        conns.filter((c) => c.open).forEach((c) => c.send(completeMsg));
        addLog('success', `Sent: ${file.name}`);
      } catch (err: any) {
        console.error('Send file error:', err);
        const errMsgText = err?.message || String(err);
        addLog('error', `Failed: ${file.name}: ${errMsgText}`);
        updateTransfer(fileId, { status: 'error', error: errMsgText });
        const errMsg: WebRTCMessage = { type: 'file-error', payload: { fileId, error: errMsgText } };
        conns.filter((c) => c.open).forEach((c) => c.send(errMsg));
      }
    },
    [conns, addLog, pushTransfer, updateTransfer]
  );

  const sendFiles = useCallback(
    async (filesList: File[] | FileList) => {
      const files = Array.from(filesList);
      for (const file of files) await sendFile(file);
    },
    [sendFile]
  );

  return { sendFiles };
};

export default useFileSender;
