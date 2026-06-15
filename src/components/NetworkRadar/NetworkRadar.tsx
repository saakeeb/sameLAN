import React, { useRef, useEffect } from 'react';

interface NetworkRadarProps {
  peerId: string | null;
  peers: { id: string; status: 'connecting' | 'connected' }[];
  activeMode?: 'file' | 'chat' | 'voice' | null;
}

const COLORS = {
  connected: '#00f5d4',
  connecting: '#f5a623',
  grid: 'rgba(0,245,212,0.07)',
  ring: 'rgba(0,245,212,0.15)',
  center: '#00f5d4',
  bg: '#030a0f',
  glow: 'rgba(0,245,212,0.35)',
  pulse: 'rgba(0,245,212,0.12)',
  label: 'rgba(180,240,255,0.85)',
};

const NetworkRadar: React.FC<NetworkRadarProps> = ({ peerId, peers, activeMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = canvas.getBoundingClientRect().width;
      const H = canvas.getBoundingClientRect().height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.38;
      tickRef.current += 0.012;
      const t = tickRef.current;

      ctx.clearRect(0, 0, W, H);

      // Background radial gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      bgGrad.addColorStop(0, 'rgba(0,20,30,0.98)');
      bgGrad.addColorStop(1, 'rgba(2,5,8,0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;
      const gridStep = 28;
      for (let x = 0; x < W; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Concentric radar rings
      [1, 0.65, 0.35].forEach((f, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0
          ? `rgba(0,245,212,${0.22 + 0.05 * Math.sin(t * 2)})`
          : `rgba(0,245,212,${0.1 + 0.03 * Math.sin(t)})`;
        ctx.lineWidth = i === 0 ? 1.2 : 0.6;
        ctx.stroke();
      });

      // Radar sweep
      const sweepAngle = t % (Math.PI * 2);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweepAngle - 0.9, sweepAngle);
      ctx.closePath();
      const grad = ctx.createLinearGradient(cx, cy, cx + R * Math.cos(sweepAngle), cy + R * Math.sin(sweepAngle));
      grad.addColorStop(0, 'rgba(0,245,212,0)');
      grad.addColorStop(1, 'rgba(0,245,212,0.18)');
      ctx.fillStyle = grad;
      ctx.fill();
      // sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(sweepAngle), cy + R * Math.sin(sweepAngle));
      ctx.strokeStyle = 'rgba(0,245,212,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Peer nodes orbiting
      const connectedPeers = peers;
      const angleStep = connectedPeers.length > 0 ? (Math.PI * 2) / connectedPeers.length : 0;
      connectedPeers.forEach((peer, i) => {
        const angle = angleStep * i + t * 0.18;
        const orbitR = R * 0.72;
        const px = cx + orbitR * Math.cos(angle);
        const py = cy + orbitR * Math.sin(angle);
        const isConnected = peer.status === 'connected';
        const peerColor = isConnected ? COLORS.connected : COLORS.connecting;

        // Orbit dashed ring
        ctx.beginPath();
        ctx.setLineDash([4, 8]);
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,245,212,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Link line center → peer
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        const lGrad = ctx.createLinearGradient(cx, cy, px, py);
        lGrad.addColorStop(0, 'rgba(0,245,212,0.4)');
        lGrad.addColorStop(1, `${peerColor}80`);
        ctx.strokeStyle = lGrad;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulse along link
        const pulsePos = (t * 0.6) % 1;
        const lpx = cx + (px - cx) * pulsePos;
        const lpy = cy + (py - cy) * pulsePos;
        ctx.beginPath();
        ctx.arc(lpx, lpy, 2, 0, Math.PI * 2);
        ctx.fillStyle = peerColor;
        ctx.fill();

        // Glow aura
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, 18);
        glowGrad.addColorStop(0, `${peerColor}55`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Peer dot
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = peerColor;
        ctx.shadowColor = peerColor;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Peer label
        const shortId = peer.id.slice(0, 6);
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = COLORS.label;
        ctx.textAlign = 'center';
        ctx.fillText(shortId, px, py - 12);
      });

      // Center node "YOU"
      const centerPulse = 0.6 + 0.2 * Math.sin(t * 3);
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * centerPulse);
      centerGlow.addColorStop(0, 'rgba(0,245,212,0.55)');
      centerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 26 * centerPulse, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.center;
      ctx.shadowColor = COLORS.center;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = COLORS.label;
      ctx.textAlign = 'center';
      ctx.fillText(peerId ? peerId.slice(0, 6) : 'YOU', cx, cy - 16);

      // Mode label bottom-right
      if (activeMode) {
        const modeLabel = { file: '⬡ FILE MODE', chat: '⬡ CHAT MODE', voice: '⬡ VOICE MODE' }[activeMode];
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = 'rgba(0,245,212,0.55)';
        ctx.textAlign = 'right';
        ctx.fillText(modeLabel, W - 8, H - 8);
      }

      // Connected count badge
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(0,245,212,0.5)';
      ctx.textAlign = 'left';
      ctx.fillText(`${connectedPeers.length} NODE${connectedPeers.length !== 1 ? 'S' : ''} ONLINE`, 8, H - 8);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [peers, peerId, activeMode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ display: 'block' }}
    />
  );
};

export default NetworkRadar;
