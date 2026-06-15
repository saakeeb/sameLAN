import { useState, useEffect, useCallback } from 'react';
import type { DataConnection } from 'peerjs';
import type { ChatMessage, WebRTCMessage } from '../types';

export const useChat = (
  conns: DataConnection[],
  peerId: string | null,
  displayName: string
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!peerId || conns.length === 0) return;

      const chatMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: peerId,
        senderName: displayName.trim() || 'Anonymous',
        text,
        timestamp: Date.now(),
      };

      const packet: WebRTCMessage = { type: 'chat', payload: chatMsg };
      conns.forEach((c) => { if (c.open) c.send(packet); });
      setMessages((prev) => [...prev, chatMsg]);
    },
    [conns, peerId, displayName]
  );

  useEffect(() => {
    if (conns.length === 0) return;

    const handlers: Array<[DataConnection, (d: unknown) => void]> = [];

    conns.forEach((conn) => {
      const handleData = (data: unknown) => {
        const packet = data as WebRTCMessage;
        if (packet?.type === 'chat') {
          setMessages((prev) => {
            // deduplicate by id
            if (prev.find((m) => m.id === (packet.payload as ChatMessage).id)) return prev;
            return [...prev, packet.payload as ChatMessage];
          });
        }
      };
      conn.on('data', handleData);
      handlers.push([conn, handleData]);
    });

    return () => {
      handlers.forEach(([conn, handler]) => conn.off('data', handler));
    };
  }, [conns]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, clearChat, setMessages };
};

export default useChat;
