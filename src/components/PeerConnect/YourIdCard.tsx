import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface YourIdCardProps {
  peerId: string | null;
}

/**
 * Displays the local peer ID in a monospace box with a clipboard button. The
 * button shows a checkmark for ~2.5s after a successful copy.
 */
const YourIdCard: React.FC<YourIdCardProps> = ({ peerId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!peerId) return;
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-slate-500 tracking-widest uppercase">
        Your Node ID
      </label>
      <div className="flex gap-2">
        <div className="flex-1 hud-id-box">{peerId || 'Generating…'}</div>
        <button
          onClick={handleCopy}
          disabled={!peerId}
          className="hud-icon-btn"
          title="Copy ID"
          aria-label="Copy peer ID to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </div>
  );
};

export default YourIdCard;
