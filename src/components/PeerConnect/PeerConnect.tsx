import React, { useState } from 'react';
import { Copy, Check, UserPlus, X, Wifi, WifiOff } from 'lucide-react';
import type { ConnectionStatus } from '../../types';
import type { PeerEntry } from '../../hooks/usePeerConnection';
import StatusBadge from '../common/StatusBadge';

interface PeerConnectProps {
  peerId: string | null;
  status: ConnectionStatus;
  peers: PeerEntry[];
  connectToPeer: (id: string) => void;
  disconnectPeer: (id: string) => void;
  disconnectAll: () => void;
}

const PeerConnect: React.FC<PeerConnectProps> = ({
  peerId,
  status,
  peers,
  connectToPeer,
  disconnectPeer,
}) => {
  const [targetId, setTargetId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!peerId) return;
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = targetId.trim().toUpperCase();
    if (!cleanId) return;
    connectToPeer(cleanId);
    setTargetId('');
  };

  const connectedPeers = peers.filter((p) => p.status === 'connected');
  const connectingPeers = peers.filter((p) => p.status === 'connecting');

  return (
    <div className="hud-panel space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-slate-300 tracking-widest uppercase">Network</h2>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Your ID */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-500 tracking-widest uppercase">Your Node ID</label>
        <div className="flex gap-2">
          <div className="flex-1 hud-id-box">
            {peerId || 'Generating…'}
          </div>
          <button
            onClick={handleCopy}
            disabled={!peerId}
            className="hud-icon-btn"
            title="Copy ID"
          >
            {copied
              ? <Check className="w-4 h-4 text-emerald-400" />
              : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Add peer form */}
      <form onSubmit={handleAdd} className="space-y-2">
        <label className="text-[10px] text-slate-500 tracking-widest uppercase">Connect to Peer</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Peer ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value.toUpperCase())}
            maxLength={10}
            className="hud-input flex-1"
          />
          <button
            type="submit"
            disabled={!peerId || !targetId.trim()}
            className="hud-add-btn"
            title="Connect"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Active connections */}
      {peers.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 tracking-widest uppercase">
            Active Nodes · {connectedPeers.length}/{peers.length}
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {peers.map((p) => (
              <div key={p.id} className="peer-row">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`peer-dot ${p.status === 'connected' ? 'peer-dot-ok' : 'peer-dot-pending'}`} />
                  <span className="font-mono text-xs font-bold text-slate-200 truncate">{p.id}</span>
                  <span className={`text-[9px] font-mono ${p.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.status === 'connected' ? 'LINKED' : 'LINKING…'}
                  </span>
                </div>
                <button
                  onClick={() => disconnectPeer(p.id)}
                  className="peer-disconnect-btn"
                  title="Disconnect"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {peers.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 border border-dashed border-slate-800/60 rounded-lg">
          <WifiOff className="w-6 h-6 text-slate-700" />
          <p className="text-slate-600 text-[11px] font-mono text-center">
            No peers connected.<br />Enter a Peer ID above.
          </p>
        </div>
      )}

      {/* Stats bar */}
      {peers.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="hud-stat-box">
            <span className="hud-stat-val text-emerald-400">{connectedPeers.length}</span>
            <span className="hud-stat-label">Connected</span>
          </div>
          <div className="hud-stat-box">
            <span className="hud-stat-val text-amber-400">{connectingPeers.length}</span>
            <span className="hud-stat-label">Linking</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerConnect;
