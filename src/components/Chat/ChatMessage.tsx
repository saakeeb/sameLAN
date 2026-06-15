import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isSelf: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isSelf }) => {
  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} space-y-0.5 animate-fade-in`}>
      <span className="text-[10px] px-1.5" style={{ color: 'rgba(120,150,180,0.7)', fontFamily: "'JetBrains Mono', monospace" }}>
        {isSelf ? 'YOU' : message.senderName}{' '}
        <span className="ml-1" style={{ color: 'rgba(90,120,150,0.6)', fontSize: '9px' }}>{timeStr}</span>
      </span>
      <div
        className={`max-w-[85%] px-3 py-2 text-sm leading-normal ${
          isSelf ? 'chat-bubble-self' : 'chat-bubble-other'
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
