import React from 'react';
import { Terminal } from 'lucide-react';

interface ActivityLogButtonProps {
  eventCount: number;
  onClick: () => void;
  isOpen: boolean;
}

/**
 * Small HUD button that sits in the header. Reveals the activity log drawer
 * when clicked. Shows a tiny badge with the current event count and a pulsing
 * dot so the user always knows logging is happening.
 */
const ActivityLogButton: React.FC<ActivityLogButtonProps> = ({
  eventCount,
  onClick,
  isOpen,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hud-icon-btn relative"
      title={isOpen ? 'Hide activity log' : 'Show activity log'}
      aria-label="Toggle activity log"
    >
      <Terminal className="w-4 h-4 text-slate-300" />
      {eventCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1
                     rounded-full text-[9px] font-mono font-bold
                     flex items-center justify-center"
          style={{
            background: 'var(--cyan)',
            color: '#020810',
            boxShadow: '0 0 8px rgba(0,245,212,0.6)',
          }}
        >
          {eventCount > 99 ? '99+' : eventCount}
        </span>
      )}
      <span
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1
                   rounded-full bg-cyan-400 animate-pulse"
        style={{ boxShadow: '0 0 6px var(--cyan)' }}
      />
    </button>
  );
};

export default ActivityLogButton;
