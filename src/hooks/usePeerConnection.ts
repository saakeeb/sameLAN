import { useEffect, useRef, useState, useCallback } from 'react';
import { Peer } from 'peerjs';
import type { DataConnection, MediaConnection } from 'peerjs';
import type { ConnectionStatus, LogEntry } from '../types';
import { generateId } from '../utils/generateId';

export interface PeerEntry {
  id: string;
  conn: DataConnection;
  status: 'connecting' | 'connected';
}

export interface VoiceParticipant {
  id: string;
  isMuted?: boolean;
  stream?: MediaStream;
}

export const usePeerConnection = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('initializing');
  const [peers, setPeers] = useState<PeerEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Voice call state
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceParticipants, setVoiceParticipants] = useState<VoiceParticipant[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const peersRef = useRef<Map<string, DataConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaCallsRef = useRef<Map<string, MediaConnection>>(new Map());

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

  // ─── Voice Call ───────────────────────────────────────────────────────────
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      return stream;
    } catch {
      addLog('error', 'Microphone access denied or unavailable');
      return null;
    }
  }, [addLog]);

  const handleIncomingCall = useCallback(
    async (call: MediaConnection) => {
      const stream = await getLocalStream();
      if (!stream) return;
      call.answer(stream);
      mediaCallsRef.current.set(call.peer, call);

      call.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        setVoiceParticipants((prev) => {
          if (prev.find((p) => p.id === call.peer)) return prev;
          return [...prev, { id: call.peer, stream: remoteStream }];
        });
      });
      call.on('close', () => {
        mediaCallsRef.current.delete(call.peer);
        setVoiceParticipants((prev) => prev.filter((p) => p.id !== call.peer));
      });
    },
    [getLocalStream]
  );

  const joinVoiceCall = useCallback(async () => {
    const stream = await getLocalStream();
    if (!stream || !peerRef.current) return;

    setIsInCall(true);
    setVoiceParticipants([{ id: peerRef.current.id!, isMuted: false }]);
    addLog('info', 'Joined voice channel');

    // Call all connected peers
    peersRef.current.forEach((_, peerId) => {
      if (!peerRef.current) return;
      const call = peerRef.current.call(peerId, stream);
      mediaCallsRef.current.set(peerId, call);

      call.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        setVoiceParticipants((prev) => {
          if (prev.find((p) => p.id === peerId)) return prev;
          return [...prev, { id: peerId, stream: remoteStream }];
        });
      });
      call.on('close', () => {
        mediaCallsRef.current.delete(peerId);
        setVoiceParticipants((prev) => prev.filter((p) => p.id !== peerId));
      });
    });

    broadcast({ type: 'voice-join', payload: { peerId: peerRef.current.id } });
  }, [getLocalStream, broadcast, addLog]);

  const leaveVoiceCall = useCallback(() => {
    mediaCallsRef.current.forEach((call) => call.close());
    mediaCallsRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setIsInCall(false);
    setIsMuted(false);
    setVoiceParticipants([]);
    addLog('info', 'Left voice channel');
    broadcast({ type: 'voice-leave', payload: { peerId: peerRef.current?.id } });
  }, [broadcast, addLog]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const enabled = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = enabled));
    setIsMuted(!enabled);
  }, [isMuted]);

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
      handleIncomingCall(call);
      if (!isInCall) setIsInCall(true);
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
  }, [addLog, handleConnection, handleIncomingCall, isInCall]);

  useEffect(() => {
    initPeer();
    return () => {
      peersRef.current.forEach((c) => c.close());
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
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
    // Voice
    isInCall,
    isMuted,
    voiceParticipants,
    joinVoiceCall,
    leaveVoiceCall,
    toggleMute,
  };
};

export default usePeerConnection;
