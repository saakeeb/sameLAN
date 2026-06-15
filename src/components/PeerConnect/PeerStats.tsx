import React from 'react';
import type { PeerEntry } from '../../hooks/usePeerConnection';

interface PeerStatsProps {
  peers: PeerEntry[];
}

/**
 * Two-cell stats bar: connected count + linking count. Hidden when there
 * are no peers.
 */
const PeerStats: React.FC<PeerStatsProps> = ({ peers }) => {
  if (peers.length === 0) return null;

  const connected = peers.filter((p) => p.status === 'connected').length;
  const linking = peers.filter((p) => p.status === 'connecting').length;

  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      <div className="hud-stat-box">
        <span className="hud-stat-val text-emerald-400">{connected}</span>
        <span className="hud-stat-label">Connected</span>
      </div>
      <div className="hud-stat-box">
        <span className="hud-stat-val text-amber-400">{linking}</span>
        <span className="hud-stat-label">Linking</span>
      </div>
    </div>
  );
};

export default PeerStats;
