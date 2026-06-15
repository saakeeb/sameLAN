import React from 'react';
import PeerConnect from '../PeerConnect/PeerConnect';
import NetworkRadar from '../NetworkRadar/NetworkRadar';
import type { ConnectionStatus } from '../../types';
import type { PeerEntry } from '../../hooks/usePeerConnection';

interface TopSectionProps {
  peerId: string | null;
  status: ConnectionStatus;
  peers: PeerEntry[];
  activeMode: 'file' | 'chat' | 'voice' | null;
  connectToPeer: (id: string) => void;
  disconnectPeer: (id: string) => void;
}

/**
 * The top row of the dashboard: network controls on the left, the radar /
 * 3D node visualizer on the right.
 */
const TopSection: React.FC<TopSectionProps> = ({
  peerId,
  status,
  peers,
  activeMode,
  connectToPeer,
  disconnectPeer,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Connection panel */}
      <div className="lg:col-span-4">
        <PeerConnect
          peerId={peerId}
          status={status}
          peers={peers}
          connectToPeer={connectToPeer}
          disconnectPeer={disconnectPeer}
        />
      </div>

      {/* Right: Radar canvas (fills remaining columns) */}
      <div
        className="lg:col-span-8 hud-panel overflow-hidden"
        style={{ minHeight: '240px', padding: 0 }}
      >
        <NetworkRadar
          peerId={peerId}
          peers={peers}
          activeMode={activeMode}
        />
      </div>
    </div>
  );
};

export default TopSection;
