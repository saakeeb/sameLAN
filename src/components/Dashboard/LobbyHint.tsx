import React from 'react';

/**
 * Shown only when no peer is connected. Renders a single line of friendly
 * guidance so the dashboard still has visual weight in its idle state.
 */
const LobbyHint: React.FC = () => (
  <div className="animate-fade-in text-center py-4 flex flex-col items-center gap-2">
    <p
      className="text-[11px] font-mono tracking-widest uppercase"
      style={{ color: 'rgba(0,245,212,0.4)' }}
    >
      Enter a Peer ID above to connect · File Share · Group Chat · Voice Call unlock automatically
    </p>
  </div>
);

export default LobbyHint;
