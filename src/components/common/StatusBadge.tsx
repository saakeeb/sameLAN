import React from 'react';
import type { ConnectionStatus } from '../../types';

interface StatusBadgeProps {
  status: ConnectionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    idle: {
      text: 'Idle',
      colorClass: 'bg-slate-800/40 text-slate-400 border-slate-700/50',
      dotClass: 'bg-slate-500',
    },
    initializing: {
      text: 'Initializing',
      colorClass: 'bg-amber-950/30 text-amber-400 border-amber-800/40',
      dotClass: 'bg-amber-500',
    },
    connecting: {
      text: 'Connecting',
      colorClass: 'bg-blue-950/30 text-blue-400 border-blue-800/40',
      dotClass: 'bg-blue-500',
    },
    connected: {
      text: 'Connected',
      colorClass: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40',
      dotClass: 'bg-emerald-500',
    },
    disconnected: {
      text: 'Disconnected',
      colorClass: 'bg-slate-800/60 text-slate-400 border-slate-700/30',
      dotClass: 'bg-slate-600',
    },
    error: {
      text: 'Error',
      colorClass: 'bg-rose-950/30 text-rose-400 border-rose-800/40',
      dotClass: 'bg-rose-500',
    },
  };

  const current = configs[status] || configs.idle;

  const showPing = status === 'connected' || status === 'connecting' || status === 'initializing';
  const pingColor =
    status === 'connected'
      ? 'bg-emerald-400'
      : status === 'connecting'
      ? 'bg-blue-400'
      : 'bg-amber-400';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.colorClass}`}
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        {showPing && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${current.dotClass}`}
        />
      </span>
      {current.text}
    </span>
  );
};

export default StatusBadge;
