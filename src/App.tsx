import { useState } from 'react';
import { Files, MessageSquare, Phone, Terminal } from 'lucide-react';
import Header from './components/Header/Header';
import PeerConnect from './components/PeerConnect/PeerConnect';
import FileDropZone from './components/FileTransfer/FileDropZone';
import TransferList from './components/FileTransfer/TransferList';
import ChatWindow from './components/Chat/ChatWindow';
import NetworkRadar from './components/NetworkRadar/NetworkRadar';
import VoiceCallWindow from './components/VoiceCall/VoiceCallWindow';
import usePeerConnection from './hooks/usePeerConnection';
import useChat from './hooks/useChat';
import useFileTransfer from './hooks/useFileTransfer';

type Mode = 'file' | 'chat' | 'voice';

function App() {
  const [displayName, setDisplayName] = useState(
    () => `Peer-${Math.floor(Math.random() * 900 + 100)}`
  );
  const [mode, setMode] = useState<Mode>('file');

  const {
    peerId,
    status,
    peers,
    conns,
    logs,
    addLog,
    connectToPeer,
    disconnectPeer,
    disconnectAll,
    isInCall,
    isMuted,
    voiceParticipants,
    joinVoiceCall,
    leaveVoiceCall,
    toggleMute,
  } = usePeerConnection();

  const { messages, sendMessage } = useChat(conns, peerId, displayName);
  const { transfers, sendFiles } = useFileTransfer(conns, addLog);

  const isConnected = peers.some((p) => p.status === 'connected');

  return (
    <div className="min-h-screen flex flex-col select-none">
      {/* Ambient background glow */}
      <div className="lobby-glow" />

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">

        {/* ─── TOP ROW: Network panel + Radar ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Left: Connection panel */}
          <div className="lg:col-span-4">
            <PeerConnect
              peerId={peerId}
              status={status}
              peers={peers}
              connectToPeer={connectToPeer}
              disconnectPeer={disconnectPeer}
              disconnectAll={disconnectAll}
            />
          </div>

          {/* Right: Radar canvas (fills remaining columns) */}
          <div
            className="lg:col-span-8 hud-panel overflow-hidden"
            style={{ minHeight: '240px', padding: 0 }}
          >
            <NetworkRadar
              peerId={peerId}
              peers={peers}
              activeMode={isConnected ? mode : null}
            />
          </div>
        </div>

        {/* ─── MODE SECTION (only shown when connected) ───────────── */}
        {isConnected && (
          <div className="animate-slide-up flex flex-col gap-5">

            {/* Mode tab bar */}
            <div className="mode-bar">
              <button
                className={`mode-tab mode-tab-file ${mode === 'file' ? 'mode-tab-active' : ''}`}
                onClick={() => setMode('file')}
              >
                <Files className="w-4 h-4" />
                File Share
              </button>
              <button
                className={`mode-tab mode-tab-chat ${mode === 'chat' ? 'mode-tab-active' : ''}`}
                onClick={() => setMode('chat')}
              >
                <MessageSquare className="w-4 h-4" />
                Group Chat
              </button>
              <button
                className={`mode-tab mode-tab-voice ${mode === 'voice' ? 'mode-tab-active' : ''}`}
                onClick={() => {
                  setMode('voice');
                  if (!isInCall) joinVoiceCall();
                }}
              >
                <Phone className="w-4 h-4" />
                Voice Call
                {isInCall && (
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                    style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
                  />
                )}
              </button>
            </div>

            {/* ── File Share Mode ───────────────────────────────── */}
            {mode === 'file' && (
              <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="hud-panel space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <Files className="w-4 h-4" style={{ color: '#60a5fa' }} />
                    <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(180,210,240,0.7)' }}>
                      Send Files
                    </h2>
                    <span className="ml-auto text-[10px] font-mono" style={{ color: 'rgba(96,165,250,0.6)' }}>
                      → {peers.filter((p) => p.status === 'connected').length} peer(s)
                    </span>
                  </div>
                  <FileDropZone disabled={!isConnected} onFilesSelected={sendFiles} />
                </div>

                <div className="hud-panel space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <Files className="w-4 h-4" style={{ color: '#60a5fa' }} />
                    <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(180,210,240,0.7)' }}>
                      Transfer History
                    </h2>
                  </div>
                  <TransferList transfers={transfers} />
                </div>
              </div>
            )}

            {/* ── Group Chat Mode ───────────────────────────────── */}
            {mode === 'chat' && (
              <div className="animate-fade-in">
                <ChatWindow
                  messages={messages}
                  peerId={peerId}
                  disabled={!isConnected}
                  displayName={displayName}
                  onDisplayNameChange={setDisplayName}
                  onSendMessage={sendMessage}
                />
              </div>
            )}

            {/* ── Voice Call Mode ───────────────────────────────── */}
            {mode === 'voice' && (
              <div className="animate-fade-in hud-panel">
                <VoiceCallWindow
                  peerId={peerId}
                  participants={voiceParticipants}
                  isMuted={isMuted}
                  onToggleMute={toggleMute}
                  onLeave={() => { leaveVoiceCall(); setMode('file'); }}
                />
              </div>
            )}
          </div>
        )}

        {/* ─── LOBBY HINT (when not connected) ────────────────────── */}
        {!isConnected && (
          <div className="animate-fade-in text-center py-4 flex flex-col items-center gap-2">
            <p className="text-[11px] font-mono tracking-widest uppercase" style={{ color: 'rgba(0,245,212,0.4)' }}>
              Enter a Peer ID above to connect · File Share · Group Chat · Voice Call unlock automatically
            </p>
          </div>
        )}

        {/* ─── ACTIVITY LOG (always visible at bottom) ─────────────── */}
        <div className="hud-panel">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <Terminal className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
            <h3 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(150,180,200,0.6)' }}>
              Activity Log
            </h3>
            <span className="ml-auto text-[9px] font-mono" style={{ color: 'rgba(100,140,170,0.4)' }}>
              {logs.length} events
            </span>
          </div>
          <div
            className="overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed"
            style={{ maxHeight: '120px' }}
          >
            {logs.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'rgba(100,130,160,0.5)' }}>
                No events yet
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span style={{ color: 'rgba(80,110,140,0.7)' }}>[{log.timestamp}]</span>
                  <span className={`log-${log.type}`}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
