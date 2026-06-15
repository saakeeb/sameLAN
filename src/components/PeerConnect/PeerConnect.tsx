import React from 'react';
import { Wifi } from 'lucide-react';
import type { ConnectionStatus } from '../../types';
import type { PeerEntry } from '../../hooks/usePeerConnection';
import StatusBadge from '../common/StatusBadge';
import YourIdCard from './YourIdCard';
import AddPeerForm from './AddPeerForm';
import PeerList from './PeerList';
import PeerStats from './PeerStats';

interface PeerConnectProps {
  peerId: string | null;
  status: ConnectionStatus;
  peers: PeerEntry[];
  connectToPeer: (id: string) => void;
  disconnectPeer: (id: string) => void;
}

/**
 * Layout shell that composes the four network widgets: your-id card,
 * add-peer form, peer list, and stats bar. Each widget owns its own
 * local state and styling.
 */
const PeerConnect: React.FC<PeerConnectProps> = ({
  peerId,
  status,
  peers,
  connectToPeer,
  disconnectPeer,
}) => {
  return (
    <div className="hud-panel space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-slate-300 tracking-widest uppercase">
            Network
          </h2>
        </div>
        <StatusBadge status={status} />
      </div>

      <YourIdCard peerId={peerId} />
      <AddPeerForm enabled={!!peerId} onAdd={connectToPeer} />
      <PeerList peers={peers} onDisconnect={disconnectPeer} />
      <PeerStats peers={peers} />
    </div>
  );
};

export default PeerConnect;
