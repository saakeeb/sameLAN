import { useEffect, useRef, useState, useCallback } from 'react';
import type { Peer } from 'peerjs';
import type { DataConnection, MediaConnection } from 'peerjs';

export interface VoiceParticipant {
  id: string;
  isMuted?: boolean;
  stream?: MediaStream;
}

export type LogFn = (
  type: 'info' | 'success' | 'warning' | 'error',
  message: string
) => void;

interface UseVoiceCallOptions {
  peer: Peer | null;
  peersRef: React.MutableRefObject<Map<string, DataConnection>>;
  addLog: LogFn;
  /** Notifies the caller so the mesh status can be reported elsewhere. */
  onCallChange?: (inCall: boolean) => void;
}

/**
 * Manages microphone acquisition, the local MediaStream, active media calls,
 * and the participant roster. Pulled out of usePeerConnection so voice
 * concerns can evolve independently of connection setup.
 */
export const useVoiceCall = ({
  peer,
  peersRef,
  addLog,
  onCallChange,
}: UseVoiceCallOptions) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceParticipants, setVoiceParticipants] = useState<VoiceParticipant[]>([]);

  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaCallsRef = useRef<Map<string, MediaConnection>>(new Map());

  // Acquire (or return cached) microphone stream
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

  const trackRemoteStream = useCallback((peerId: string, remoteStream: MediaStream) => {
    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    setVoiceParticipants((prev) =>
      prev.find((p) => p.id === peerId) ? prev : [...prev, { id: peerId, stream: remoteStream }]
    );
  }, []);

  const handleIncomingCall = useCallback(
    async (call: MediaConnection) => {
      const stream = await getLocalStream();
      if (!stream) return;
      call.answer(stream);
      mediaCallsRef.current.set(call.peer, call);

      call.on('stream', (remoteStream) => trackRemoteStream(call.peer, remoteStream));
      call.on('close', () => {
        mediaCallsRef.current.delete(call.peer);
        setVoiceParticipants((prev) => prev.filter((p) => p.id !== call.peer));
      });
    },
    [getLocalStream, trackRemoteStream]
  );

  const joinVoiceCall = useCallback(async () => {
    const stream = await getLocalStream();
    if (!stream || !peer?.id) return;

    setIsInCall(true);
    setVoiceParticipants([{ id: peer.id, isMuted: false }]);
    onCallChange?.(true);
    addLog('info', 'Joined voice channel');

    peersRef.current.forEach((_conn, pid) => {
      if (!peer) return;
      const call = peer.call(pid, stream);
      mediaCallsRef.current.set(pid, call);

      call.on('stream', (remoteStream) => trackRemoteStream(pid, remoteStream));
      call.on('close', () => {
        mediaCallsRef.current.delete(pid);
        setVoiceParticipants((prev) => prev.filter((p) => p.id !== pid));
      });
    });
  }, [getLocalStream, peer, peersRef, addLog, onCallChange, trackRemoteStream]);

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
    onCallChange?.(false);
    addLog('info', 'Left voice channel');
  }, [addLog, onCallChange]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const nextEnabled = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = nextEnabled));
    setIsMuted(!nextEnabled);
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mediaCallsRef.current.forEach((c) => c.close());
      mediaCallsRef.current.clear();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  return {
    isInCall,
    isMuted,
    voiceParticipants,
    handleIncomingCall,
    joinVoiceCall,
    leaveVoiceCall,
    toggleMute,
  };
};

export default useVoiceCall;
