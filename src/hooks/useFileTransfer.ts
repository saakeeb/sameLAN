import type { DataConnection } from 'peerjs';
import { useFileSender } from './useFileSender';
import { useFileReceiver } from './useFileReceiver';

type LogFn = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: string
) => void;

/**
 * Thin orchestrator that wires the sender and receiver halves of the file
 * transfer pipeline onto the same transfer list. Components only need
 * `transfers` (for display) and `sendFiles` (to dispatch from a dropzone or
 * picker).
 */
export const useFileTransfer = (conns: DataConnection[], addLog: LogFn) => {
  const { transfers, pushTransfer, updateTransfer } = useFileReceiver(conns, addLog);
  const { sendFiles } = useFileSender({ conns, addLog, pushTransfer, updateTransfer });

  return { transfers, sendFiles };
};

export default useFileTransfer;
