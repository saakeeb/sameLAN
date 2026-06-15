import React from 'react';
import { Wifi } from 'lucide-react';

interface HeaderProps {
  /** Slot rendered just before the WebRTC Mesh pill — used for the activity-log toggle. */
  rightSlot?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ rightSlot }) => (
  <header className="hud-header">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-lg opacity-30 animate-pulse-glow" />
        <div className="relative p-2 bg-cyan-950/40 border border-cyan-700/50 rounded-lg">
          <Wifi className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
      <div>
        <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-300 to-blue-400 bg-clip-text text-transparent">
          SameLAN&nbsp;<span className="text-slate-500 font-light">·</span>&nbsp;SHARE
        </h1>
        <p className="text-[9px] text-slate-500 tracking-[0.2em] uppercase font-semibold mt-0.5">
          Direct P2P · Local Wi-Fi · Zero Cloud
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {rightSlot}
      <div className="hud-badge-pill">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        WebRTC Mesh
      </div>
    </div>
  </header>
);

export default Header;
