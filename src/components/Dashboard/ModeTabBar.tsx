import React from 'react';
import { Files, MessageSquare, Phone } from 'lucide-react';

type Mode = 'file' | 'chat' | 'voice';

interface ModeTabBarProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
  isInCall: boolean;
  onJoinCall: () => void;
}

/**
 * The tab bar that lets the user switch between File Share, Group Chat, and
 * Voice Call modes. Keeps the visual + state wiring in one place.
 */
const ModeTabBar: React.FC<ModeTabBarProps> = ({
  mode,
  onChange,
  isInCall,
  onJoinCall,
}) => {
  const handleVoiceClick = () => {
    onChange('voice');
    if (!isInCall) onJoinCall();
  };

  return (
    <div className="mode-bar">
      <button
        className={`mode-tab mode-tab-file ${mode === 'file' ? 'mode-tab-active' : ''}`}
        onClick={() => onChange('file')}
      >
        <Files className="w-4 h-4" />
        File Share
      </button>

      <button
        className={`mode-tab mode-tab-chat ${mode === 'chat' ? 'mode-tab-active' : ''}`}
        onClick={() => onChange('chat')}
      >
        <MessageSquare className="w-4 h-4" />
        Group Chat
      </button>

      <button
        className={`mode-tab mode-tab-voice ${mode === 'voice' ? 'mode-tab-active' : ''}`}
        onClick={handleVoiceClick}
      >
        <Phone className="w-4 h-4" />
        Voice Call
        {isInCall && (
          <span
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
            style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
          />
        )}
      </button>
    </div>
  );
};

export default ModeTabBar;
