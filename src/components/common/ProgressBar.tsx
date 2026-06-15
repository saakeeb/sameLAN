import React from 'react';
import { formatSpeed } from '../../utils/formatSize';

interface ProgressBarProps {
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'error';
  speed?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status, speed }) => {
  const fillClass =
    status === 'completed'  ? 'hud-progress-fill hud-progress-fill-complete' :
    status === 'error'      ? 'hud-progress-fill hud-progress-fill-error' :
                              'hud-progress-fill';

  const pctColor =
    status === 'completed'  ? '#34d399' :
    status === 'error'      ? '#fb7185' :
    status === 'transferring' ? 'var(--cyan)' : 'rgba(150,180,200,0.6)';

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-[11px]">
        <span className="font-mono" style={{ color: 'rgba(150,180,200,0.6)' }}>
          {status === 'transferring' && speed !== undefined && speed > 0 && formatSpeed(speed)}
          {status === 'completed' && 'Finished'}
          {status === 'error'     && <span style={{ color: '#fb7185' }}>Failed</span>}
          {status === 'pending'   && 'Ready'}
        </span>
        <span className="font-bold font-mono" style={{ color: pctColor }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="hud-progress-track">
        <div
          className={fillClass}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
