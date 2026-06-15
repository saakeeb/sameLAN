import React from 'react';
import { GitBranch, Heart, Radio } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="hud-footer">
    <div className="hud-footer-inner">
      <div className="hud-footer-left">
        <Radio className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hud-footer-brand">
          SameLAN<span className="text-slate-500 font-light">·</span>SHARE
        </span>
        <span className="hud-footer-divider" />
        <span className="hud-footer-tag">v0.1.0 · build {new Date().getFullYear()}</span>
      </div>

      <div className="hud-footer-center">
        <span className="hud-footer-dot" />
        <span>All traffic stays on your local network</span>
        <span className="hud-footer-divider" />
        <span className="inline-flex items-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> for P2P
        </span>
      </div>

      <div className="hud-footer-right">
        <a
          href="https://github.com/saakeeb/sameLAN"
          target="_blank"
          rel="noreferrer noopener"
          className="hud-footer-link"
          aria-label="SameLAN on GitHub"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Source</span>
        </a>
        <span className="hud-footer-divider" />
        <span className="hud-footer-pill">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          ONLINE
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
