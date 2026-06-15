import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  messages: ChatMessageType[];
  peerId: string | null;
  disabled: boolean;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  peerId,
  disabled,
  displayName,
  onDisplayNameChange,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="hud-panel flex flex-col" style={{ height: '420px' }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 mb-3 pb-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <MessageSquare className="w-4 h-4" style={{ color: '#a78bfa' }} />
        <h2
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'rgba(180,210,240,0.7)' }}
        >
          Group Chat
        </h2>
        <span
          className="ml-auto text-[10px] font-mono"
          style={{ color: 'rgba(167,139,250,0.55)' }}
        >
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 scroll-smooth">
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-2 select-none"
            style={{ color: 'rgba(100,130,160,0.5)' }}
          >
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-sm text-center">
              {disabled ? 'Connect a peer to chat' : 'No messages yet. Say hello! 👋'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} isSelf={msg.senderId === peerId} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput
          disabled={disabled}
          displayName={displayName}
          onDisplayNameChange={onDisplayNameChange}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
