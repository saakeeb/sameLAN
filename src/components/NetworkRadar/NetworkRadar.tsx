import React, { useRef } from 'react';
import { useRadarCanvas, type RadarPeer, type ActiveMode } from '../../hooks/useRadarCanvas';

interface NetworkRadarProps {
  peerId: string | null;
  peers: RadarPeer[];
  activeMode?: ActiveMode;
}

/**
 * Animated radar canvas. All rendering lives in `useRadarCanvas`; this
 * component just owns the <canvas> ref and forwards the peer/mode props.
 */
const NetworkRadar: React.FC<NetworkRadarProps> = ({ peerId, peers, activeMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useRadarCanvas({ canvasRef, peers, peerId, activeMode });

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ display: 'block' }}
    />
  );
};

export default NetworkRadar;
