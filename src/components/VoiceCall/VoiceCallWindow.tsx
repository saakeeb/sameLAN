import React from 'react';
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react';
import type { VoiceParticipant } from '../../hooks/useVoiceCall';

interface VoiceCallWindowProps {
  peerId: string | null;
  participants: VoiceParticipant[];
  isMuted: boolean;
  onToggleMute: () => void;
  onLeave: () => void;
}

const WaveBar: React.FC<{ active: boolean; delay: number }> = ({ active, delay }) => (
  <div
    className="voice-wave-bar"
    style={{
      animationDelay: `${delay}ms`,
      animationPlayState: active ? 'running' : 'paused',
      height: active ? undefined : '4px',
    }}
  />
);

const ParticipantCard: React.FC<{ id: string; isSelf: boolean; isMuted?: boolean }> = ({
  id,
  isSelf,
  isMuted,
}) => {
  const shortId = isSelf ? 'YOU' : id.slice(0, 6);
  const delays = [0, 80, 160, 240, 300];

  return (
    <div className="voice-participant-card">
      <div className="voice-avatar">
        <span>{shortId[0]}</span>
        {!isMuted && <div className="voice-avatar-ring" />}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[11px] font-mono font-bold text-cyan-300">{shortId}</span>
        <div className="flex items-end gap-[3px] h-5">
          {delays.map((d, i) => (
            <WaveBar key={i} active={!isMuted} delay={d} />
          ))}
        </div>
        {isMuted && (
          <span className="text-[9px] text-rose-400 font-mono tracking-widest uppercase">muted</span>
        )}
      </div>
    </div>
  );
};

const VoiceCallWindow: React.FC<VoiceCallWindowProps> = ({
  peerId,
  participants,
  isMuted,
  onToggleMute,
  onLeave,
}) => {
  return (
    <div className="voice-window flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-cyan-900/40">
        <div className="relative">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <h2 className="text-xs font-semibold text-slate-300 tracking-widest uppercase">
          Voice Channel
        </h2>
        <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
          LIVE · {participants.length}
        </span>
      </div>

      {/* Participants */}
      <div className="flex flex-wrap gap-3 justify-center min-h-[120px] items-center">
        {/* Self */}
        <ParticipantCard id={peerId || 'YOU'} isSelf isMuted={isMuted} />
        {/* Others */}
        {participants
          .filter((p) => p.id !== peerId)
          .map((p) => (
            <ParticipantCard key={p.id} id={p.id} isSelf={false} />
          ))}
        {participants.filter((p) => p.id !== peerId).length === 0 && (
          <p className="text-slate-600 text-xs font-mono text-center">
            Waiting for peers to join…
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center pt-2 border-t border-cyan-900/30">
        <button
          onClick={onToggleMute}
          className={`voice-ctrl-btn ${isMuted ? 'voice-ctrl-muted' : 'voice-ctrl-active'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-[10px] font-mono mt-0.5">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          onClick={onLeave}
          className="voice-ctrl-btn voice-ctrl-leave"
          title="Leave call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-[10px] font-mono mt-0.5">Leave</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceCallWindow;
