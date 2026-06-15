import { useEffect, useRef, useState, useCallback } from 'react';
import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { ConnectionStatus, LogEntry } from '../types';
import { generateId } from '../utils/generateId';
import { useVoiceCall } from './useVoiceCall';

export interface PeerEntry {
  id: string;
  conn: DataConnection;
  status: 'connecting' | 'connected';
}

export const usePeerConnection = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('initializing');
  const [peers, setPeers] = useState<PeerEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const peersRef = useRef<Map<string, DataConnection>>(new Map());

  // ─── Logging ──────────────────────────────────────────────────────────────
  const addLog = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      },
      ...prev,
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    // re-add a single marker so the log isn't immediately empty again
    setLogs([
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: 'Activity log cleared',
      },
    ]);
  }, []);

  // ─── Broadcast helper ─────────────────────────────────────────────────────
  const broadcast = useCallback((packet: object, excludeId?: string) => {
    peersRef.current.forEach((conn, id) => {
      if (id !== excludeId && conn.open) conn.send(packet);
    });
  }, []);

  // ─── Broadcast current peer list to all (mesh bootstrap) ──────────────────
  const broadcastPeerList = useCallback(() => {
    const ids = Array.from(peersRef.current.keys());
    peersRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: 'peer-list', payload: { peers: ids.filter((i) => i !== conn.peer) } });
      }
    });
  }, []);

  // ─── Handle an incoming or outgoing DataConnection ────────────────────────
  const handleConnection = useCallback(
    (connection: DataConnection) => {
      const id = connection.peer;
      if (peersRef.current.has(id)) return; // already tracked

      peersRef.current.set(id, connection);
      setPeers((prev) => [...prev, { id, conn: connection, status: 'connecting' }]);
      setStatus('connected');
      addLog('info', `Connecting to ${id}...`);

      connection.on('open', () => {
        setPeers((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'connected' } : p)));
        addLog('success', `P2P link established with ${id}`);
        // Tell the new peer about everyone else and vice-versa
        broadcastPeerList();
      });

      connection.on('data', (data: unknown) => {
        const packet = data as { type: string; payload: any };
        if (!packet) return;
        if (packet.type === 'peer-list') {
          // Auto-connect to any new peers we haven't met yet
          const incoming: string[] = packet.payload?.peers || [];
          incoming.forEach((pid) => {
            if (pid !== peerRef.current?.id && !peersRef.current.has(pid)) {
              addLog('info', `Discovered peer ${pid} via mesh — auto-connecting...`);
              connectToPeer(pid);
            }
          });
        }
      });

      connection.on('close', () => {
        peersRef.current.delete(id);
        setPeers((prev) => prev.filter((p) => p.id !== id));
        addLog('warning', `Link with ${id} closed`);
        if (peersRef.current.size === 0) setStatus('idle');
      });

      connection.on('error', (err) => {
        peersRef.current.delete(id);
        setPeers((prev) => prev.filter((p) => p.id !== id));
        addLog('error', `Connection error with ${id}: ${err.message}`);
        if (peersRef.current.size === 0) setStatus('error');
      });
    },
    [addLog, broadcastPeerList] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─── Connect to a specific peer ───────────────────────────────────────────
  const connectToPeer = useCallback(
    (targetId: string) => {
      if (!peerRef.current || peerRef.current.destroyed) {
        addLog('error', 'Cannot connect: Peer helper not ready');
        return;
      }
      const cleanId = targetId.trim().toUpperCase();
      if (!cleanId) return;
      if (cleanId === peerRef.current.id) {
        addLog('error', 'Cannot connect to your own Peer ID');
        return;
      }
      if (peersRef.current.has(cleanId)) {
        addLog('warning', `Already connected to ${cleanId}`);
        return;
      }
      addLog('info', `Initiating connection to ${cleanId}...`);
      const connection = peerRef.current.connect(cleanId, { reliable: true });
      handleConnection(connection);
    },
    [handleConnection, addLog]
  );

  // ─── Disconnect a specific peer ───────────────────────────────────────────
  const disconnectPeer = useCallback(
    (targetId: string) => {
      const conn = peersRef.current.get(targetId);
      if (conn) {
        addLog('info', `Closing connection to ${targetId}...`);
        conn.close();
      }
    },
    [addLog]
  );

  // ─── Disconnect everyone ──────────────────────────────────────────────────
  const disconnectAll = useCallback(() => {
    peersRef.current.forEach((conn) => conn.close());
    peersRef.current.clear();
    setPeers([]);
    setStatus('idle');
  }, []);

  // ─── Voice concerns delegated to useVoiceCall ─────────────────────────────
  const voice = useVoiceCall({ peer: peerRef.current, peersRef, addLog });

  // ─── Init Peer ────────────────────────────────────────────────────────────
  const initPeer = useCallback(() => {
    setStatus('initializing');
    const newId = generateId();
    addLog('info', 'Initializing client...');

    const peer = new Peer(newId, { debug: 1 });
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      setStatus('idle');
      addLog('success', `Ready. Share your ID: ${id}`);
    });

    peer.on('connection', (incoming) => {
      handleConnection(incoming);
    });

    peer.on('call', (call) => {
      addLog('info', `Incoming voice call from ${call.peer}`);
      voice.handleIncomingCall(call);
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      addLog('error', `Signal error: ${err.type}`);
      if (err.type === 'unavailable-id') {
        addLog('info', 'Regenerating ID and retrying...');
        initPeer();
      } else {
        setStatus('error');
      }
    });

    peer.on('disconnected', () => {
      addLog('warning', 'Signaling server offline. Reconnecting...');
      peer.reconnect();
    });

    peer.on('close', () => {
      addLog('error', 'Peer destroyed');
      setStatus('disconnected');
    });
  }, [addLog, handleConnection, voice]);

  useEffect(() => {
    initPeer();
    return () => {
      peersRef.current.forEach((c) => c.close());
      if (peerRef.current) peerRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived: all open DataConnections as an array for hooks that need them
  const conns = peers.filter((p) => p.status === 'connected').map((p) => p.conn);

  return {
    peerId,
    status,
    peers,
    conns,
    logs,
    addLog,
    broadcast,
    connectToPeer,
    disconnectPeer,
    disconnectAll,
    clearLogs,
    // Voice
    ...voice,
  };
};

export default usePeerConnection;
