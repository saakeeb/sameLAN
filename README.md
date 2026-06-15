# sameLAN

**sameLAN** is a browser-based peer-to-peer sharing app for people on the same Wi-Fi network. It lets you send files, chat, and voice-call nearby devices directly — no accounts, no cloud, no server in the middle.

## Features

- **Mesh file transfer** — drop a file into the lobby and it streams to every connected peer in parallel, with backpressure-aware chunking and per-peer progress.
- **Group chat** — broadcast messages to everyone in the room.
- **Voice calls** — WebRTC MediaConnection for low-latency voice between peers, with mute and leave controls.
- **Activity log** — every connection, transfer, and call event is captured in a slide-down drawer; clearable on demand.
- **HUD-style UI** — radar canvas, holo-frame panels, and a terminal-inspired palette.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **PeerJS** for WebRTC DataConnection (file + chat) and MediaConnection (voice)
- **TailwindCSS v4** for the HUD design system
- **lucide-react** for icons

## Running locally

```bash
npm install
npm run dev
```

Open the printed URL on two or more devices on the same network. Each device generates a short peer ID — share the ID, click **+**, and you're connected.

## How it works

SameLAN uses PeerJS's public broker service only to **introduce** peers; once two devices have shaken hands, all traffic flows directly over WebRTC. Files are sliced into chunks, broadcast to every connection, and reassembled on the receiver. Chat and voice ride the same data and media channels.

## License

MIT.
