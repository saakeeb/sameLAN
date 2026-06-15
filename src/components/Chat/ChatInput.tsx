import React, { useState } from 'react';
import { Send, User } from 'lucide-react';

interface ChatInputProps {
  disabled: boolean;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onSendMessage: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  disabled,
  displayName,
  onDisplayNameChange,
  onSendMessage,
}) => {
  const [text, setText] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="space-y-2">
      {/* Name alias row */}
      <div className="flex items-center gap-2">
        {showNameInput ? (
          <div
            className="flex items-center gap-1.5 flex-1 rounded-lg px-2 py-1"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(0,245,212,0.18)' }}
          >
            <User className="w-3.5 h-3.5" style={{ color: 'rgba(150,180,200,0.5)' }} />
            <input
              type="text"
              placeholder="Your alias"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none w-full"
              style={{ color: '#c8daea' }}
              maxLength={15}
            />
            <button
              type="button"
              onClick={() => setShowNameInput(false)}
              className="text-[10px] font-bold px-1 transition-colors"
              style={{ color: 'var(--cyan)' }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNameInput(true)}
            className="flex items-center gap-1 text-[11px] transition-colors"
            style={{ color: 'rgba(120,150,180,0.6)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            <User className="w-3.5 h-3.5" />
            <span>
              Alias:{' '}
              <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>
                {displayName.trim() || 'Anonymous'}
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Message form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={disabled ? 'Connect a peer to chat…' : 'Type a message…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="hud-input text-left"
          style={{ letterSpacing: '0', fontFamily: "'Inter', sans-serif", fontWeight: 400, textAlign: 'left' }}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="hud-add-btn"
          style={{ width: '38px', height: '38px' }}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
