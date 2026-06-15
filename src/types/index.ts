export type ConnectionStatus =
  | 'idle'
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface PeerState {
  peerId: string | null;
  targetPeerId: string | null;
  status: ConnectionStatus;
  error: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  totalChunks: number;
}

export interface TransferItemState {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number; // percentage (0 to 100)
  status: 'pending' | 'transferring' | 'completed' | 'error';
  direction: 'send' | 'receive';
  speed: number; // bytes per second
  error?: string;
  chunksReceived?: number;
  totalChunks?: number;
  blobUrl?: string; // set once reconstruction is complete
}

export type WebRTCMessageType =
  | 'chat'
  | 'file-header'
  | 'file-chunk'
  | 'file-complete'
  | 'file-error'
  | 'peer-list'
  | 'voice-join'
  | 'voice-leave'
  | 'call-status';

export interface WebRTCMessage {
  type: WebRTCMessageType;
  payload: any;
}

