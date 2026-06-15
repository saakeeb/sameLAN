import React from 'react';
import ModeTabBar from './ModeTabBar';
import { Files } from 'lucide-react';
import FileDropZone from '../FileTransfer/FileDropZone';
import TransferList from '../FileTransfer/TransferList';
import ChatWindow from '../Chat/ChatWindow';
import VoiceCallWindow from '../VoiceCall/VoiceCallWindow';
import type { ChatMessage, TransferItemState } from '../../types';
import type { VoiceParticipant } from '../../hooks/useVoiceCall';

type Mode = 'file' | 'chat' | 'voice';

interface ModeSectionProps {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  isConnected: boolean;
  // file mode
  sendFiles: (files: FileList) => void;
  transfers: TransferItemState[];
  connectedPeerCount: number;
  // chat mode
  messages: ChatMessage[];
  peerId: string | null;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  sendMessage: (text: string) => void;
  // voice mode
  isInCall: boolean;
  isMuted: boolean;
  voiceParticipants: VoiceParticipant[];
  onJoinCall: () => void;
  onToggleMute: () => void;
  onLeaveCall: () => void;
}

/**
 * Hosts the mode-tab bar and the content for the currently selected mode.
 * The "file" pane gets the gaming-style holo frame; chat and voice get
 * their own neon brackets so each mode feels distinct.
 */
const ModeSection: React.FC<ModeSectionProps> = ({
  mode,
  onModeChange,
  isConnected,
  sendFiles,
  transfers,
  connectedPeerCount,
  messages,
  peerId,
  displayName,
  onDisplayNameChange,
  sendMessage,
  isInCall,
  isMuted,
  voiceParticipants,
  onJoinCall,
  onToggleMute,
  onLeaveCall,
}) => {
  return (
    <div className="animate-slide-up flex flex-col gap-5">
      <ModeTabBar
        mode={mode}
        onChange={onModeChange}
        isInCall={isInCall}
        onJoinCall={onJoinCall}
      />

      {/* ── File Share Mode ───────────────────────────────── */}
      {mode === 'file' && (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="hud-panel holo-frame holo-frame-blue space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Files className="w-4 h-4" style={{ color: '#60a5fa' }} />
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(180,210,240,0.7)' }}>
                Send Files
              </h2>
              <span className="ml-auto text-[10px] font-mono" style={{ color: 'rgba(96,165,250,0.6)' }}>
                → {connectedPeerCount} peer(s)
              </span>
            </div>
            <FileDropZone disabled={!isConnected} onFilesSelected={sendFiles} />
          </div>

          <div className="hud-panel holo-frame holo-frame-blue space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Files className="w-4 h-4" style={{ color: '#60a5fa' }} />
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(180,210,240,0.7)' }}>
                Transfer History
              </h2>
            </div>
            <TransferList transfers={transfers} />
          </div>
        </div>
      )}

      {/* ── Group Chat Mode ───────────────────────────────── */}
      {mode === 'chat' && (
        <div className="animate-fade-in holo-frame holo-frame-purple">
          <ChatWindow
            messages={messages}
            peerId={peerId}
            disabled={!isConnected}
            displayName={displayName}
            onDisplayNameChange={onDisplayNameChange}
            onSendMessage={sendMessage}
          />
        </div>
      )}

      {/* ── Voice Call Mode ───────────────────────────────── */}
      {mode === 'voice' && (
        <div className="animate-fade-in holo-frame holo-frame-green">
          <VoiceCallWindow
            peerId={peerId}
            participants={voiceParticipants}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            onLeave={onLeaveCall}
          />
        </div>
      )}
    </div>
  );
};

// re-exported for App.tsx to avoid importing the type in two places
export type { Mode };
export default ModeSection;
