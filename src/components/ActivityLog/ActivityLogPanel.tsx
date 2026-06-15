import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2, X } from 'lucide-react';
import type { LogEntry } from '../../types';

interface ActivityLogPanelProps {
  logs: LogEntry[];
  onClose: () => void;
  onClear: () => void;
}

/**
 * Terminal-style sliding drawer that shows the activity log. Rendered as a
 * fixed panel that drops down from the header so it never competes for
 * dashboard real estate.
 */
const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({
  logs,
  onClose,
  onClear,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top (newest entries are prepended)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [logs.length]);

  return (
    <div
      className="activity-log-drawer animate-slide-down"
      role="dialog"
      aria-label="Activity log"
    >
      <div className="hud-panel" style={{ padding: 0 }}>
        {/* Header bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <Terminal className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
          <h3
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: 'rgba(150,180,200,0.75)' }}
          >
            Activity Log
          </h3>
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded"
            style={{
              color: 'rgba(100,140,170,0.6)',
              background: 'rgba(0,245,212,0.05)',
              border: '1px solid rgba(0,245,212,0.1)',
            }}
          >
            {logs.length} event{logs.length !== 1 ? 's' : ''}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onClear}
              disabled={logs.length === 0}
              className="hud-icon-btn"
              style={{ width: 28, height: 28 }}
              title="Clear log"
              aria-label="Clear activity log"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hud-icon-btn"
              style={{ width: 28, height: 28 }}
              title="Close"
              aria-label="Close activity log"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={scrollRef}
          className="activity-log-body font-mono text-[11px] leading-relaxed"
        >
          {logs.length === 0 ? (
            <div
              className="text-center py-10"
              style={{ color: 'rgba(100,130,160,0.5)' }}
            >
              <Terminal className="w-7 h-7 mx-auto mb-2 opacity-30" />
              <p>No events yet</p>
              <p
                className="text-[10px] mt-1"
                style={{ color: 'rgba(80,110,140,0.4)' }}
              >
                Connect a peer to start logging.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {logs.map((log) => (
                <li key={log.id} className="activity-log-row">
                  <span
                    className="activity-log-time"
                    style={{ color: 'rgba(80,110,140,0.7)' }}
                  >
                    [{log.timestamp}]
                  </span>
                  <span className={`log-${log.type} activity-log-msg`}>
                    {log.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPanel;
