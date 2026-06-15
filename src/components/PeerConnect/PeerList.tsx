import React from 'react';
import { X, WifiOff } from 'lucide-react';
import type { PeerEntry } from '../../hooks/usePeerConnection';

interface PeerListProps {
  peers: PeerEntry[];
  onDisconnect: (id: string) => void;
}

/**
 * Scrollable list of active peer rows. Renders a dashed empty-state when no
 * peers are present.
 */
const PeerList: React.FC<PeerListProps> = ({ peers, onDisconnect }) => {
  if (peers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 border border-dashed border-slate-800/60 rounded-lg">
        <WifiOff className="w-6 h-6 text-slate-700" />
        <p className="text-slate-600 text-[11px] font-mono text-center">
          No peers connected.
          <br />
          Enter a Peer ID above.
        </p>
      </div>
    );
  }

  const connected = peers.filter((p) => p.status === 'connected').length;

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-slate-500 tracking-widest uppercase">
        Active Nodes · {connected}/{peers.length}
      </label>
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {peers.map((p) => (
          <div key={p.id} className="peer-row">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`peer-dot ${
                  p.status === 'connected' ? 'peer-dot-ok' : 'peer-dot-pending'
                }`}
              />
              <span className="font-mono text-xs font-bold text-slate-200 truncate">
                {p.id}
              </span>
              <span
                className={`text-[9px] font-mono ${
                  p.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {p.status === 'connected' ? 'LINKED' : 'LINKING…'}
              </span>
            </div>
            <button
              onClick={() => onDisconnect(p.id)}
              className="peer-disconnect-btn"
              title="Disconnect"
              aria-label={`Disconnect ${p.id}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeerList;
