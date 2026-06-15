import { useState } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import TopSection from './components/Dashboard/TopSection';
import ModeSection from './components/Dashboard/ModeSection';
import type { Mode } from './components/Dashboard/ModeSection';
import LobbyHint from './components/Dashboard/LobbyHint';
import ActivityLogButton from './components/ActivityLog/ActivityLogButton';
import ActivityLogPanel from './components/ActivityLog/ActivityLogPanel';
import usePeerConnection from './hooks/usePeerConnection';
import useChat from './hooks/useChat';
import useFileTransfer from './hooks/useFileTransfer';

function App() {
  const [displayName, setDisplayName] = useState(
    () => `Peer-${Math.floor(Math.random() * 900 + 100)}`
  );
  const [mode, setMode] = useState<Mode>('file');
  const [logOpen, setLogOpen] = useState(false);

  const {
    peerId, status, peers, conns, logs, addLog,
    connectToPeer, disconnectPeer,
    clearLogs,
    isInCall, isMuted, voiceParticipants,
    joinVoiceCall, leaveVoiceCall, toggleMute,
  } = usePeerConnection();

  const { messages, sendMessage } = useChat(conns, peerId, displayName);
  const { transfers, sendFiles } = useFileTransfer(conns, addLog);

  const isConnected = peers.some((p) => p.status === 'connected');
  const connectedCount = peers.filter((p) => p.status === 'connected').length;

  return (
    <div className="min-h-screen flex flex-col select-none">
      <div className="lobby-glow" />

      <Header
        rightSlot={
          <ActivityLogButton
            eventCount={logs.length}
            onClick={() => setLogOpen((v) => !v)}
            isOpen={logOpen}
          />
        }
      />

      {logOpen && (
        <ActivityLogPanel
          logs={logs}
          onClose={() => setLogOpen(false)}
          onClear={clearLogs}
        />
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-5">
        <TopSection
          peerId={peerId}
          status={status}
          peers={peers}
          activeMode={isConnected ? mode : null}
          connectToPeer={connectToPeer}
          disconnectPeer={disconnectPeer}
        />

        {isConnected && (
          <ModeSection
            mode={mode}
            onModeChange={setMode}
            isConnected={isConnected}
            sendFiles={sendFiles}
            transfers={transfers}
            connectedPeerCount={connectedCount}
            messages={messages}
            peerId={peerId}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            sendMessage={sendMessage}
            isInCall={isInCall}
            isMuted={isMuted}
            voiceParticipants={voiceParticipants}
            onJoinCall={joinVoiceCall}
            onToggleMute={toggleMute}
            onLeaveCall={() => { leaveVoiceCall(); setMode('file'); }}
          />
        )}

        {!isConnected && <LobbyHint />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
