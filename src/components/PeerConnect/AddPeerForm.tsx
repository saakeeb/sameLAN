import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

interface AddPeerFormProps {
  /** When false the input is disabled — peer isn't ready yet. */
  enabled: boolean;
  onAdd: (id: string) => void;
}

/**
 * Text input + add button for connecting to a peer by ID. Trims and
 * uppercases before submitting.
 */
const AddPeerForm: React.FC<AddPeerFormProps> = ({ enabled, onAdd }) => {
  const [targetId, setTargetId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = targetId.trim().toUpperCase();
    if (!cleanId) return;
    onAdd(cleanId);
    setTargetId('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="text-[10px] text-slate-500 tracking-widest uppercase">
        Connect to Peer
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Peer ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value.toUpperCase())}
          maxLength={10}
          className="hud-input flex-1"
          disabled={!enabled}
        />
        <button
          type="submit"
          disabled={!enabled || !targetId.trim()}
          className="hud-add-btn"
          title="Connect"
          aria-label="Connect to peer"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default AddPeerForm;
