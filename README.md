# ClubCapy 🦫

A Club Penguin-style multiplayer virtual world featuring capybaras! Built with Phaser.js for the game client and Node.js + Socket.io for real-time multiplayer.

## Features

- Real-time multiplayer with Socket.io
- Multiple rooms (Town, Beach, Forest) connected via portals
- Animated capybara characters with 4-directional movement
- In-game chat system
- Player name tags and room indicators

## Project Structure

```
clubcapy/
├── client/                 # Phaser.js game client (Vite + TypeScript)
│   ├── src/
│   │   ├── main.ts         # Phaser game config & entry
│   │   ├── scenes/         # Room scenes (Boot, Town, Beach, Forest)
│   │   ├── entities/       # Capybara player class
│   │   ├── network/        # Socket.io client wrapper
│   │   └── ui/             # Chat overlay
│   └── public/assets/      # Sprites and backgrounds
├── server/                 # Node.js + Socket.io server
│   └── src/
│       ├── index.ts        # Express + Socket.io setup
│       ├── RoomManager.ts  # Room state & player management
│       └── PlayerManager.ts # Player sessions
└── shared/                 # Shared types and constants
    └── src/
        ├── types.ts        # TypeScript interfaces
        └── constants.ts    # Room configs, limits
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

Run both client and server concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Server (port 3001)
npm run dev:server

# Terminal 2 - Client (port 3000)
npm run dev:client
```

Open http://localhost:3000 in your browser. Open multiple tabs to test multiplayer!

### Build

```bash
npm run build
```

## Controls

- **Arrow Keys**: Move your capybara
- **Enter**: Focus chat input
- **Walk to edges**: Travel between rooms

## Room Layout

```
        [Forest]
            |
[Beach] - [Town]
```

- **Town**: Central hub, starting area
- **Beach**: West of town, sandy shores
- **Forest**: North of town, wooded area

## Tech Stack

- **Client**: Phaser 3, TypeScript, Vite, Socket.io-client
- **Server**: Express, Socket.io, TypeScript
- **Shared**: TypeScript types and constants

## Deployment

Since this is a real-time multiplayer game using WebSockets, you need to deploy the client and server separately:

### Server → Railway (recommended)

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `clubcapy` repository
4. Add environment variable:
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app` (your Vercel URL)
5. Railway will auto-detect the `railway.json` and deploy
6. Copy your Railway URL (e.g., `https://clubcapy-server.up.railway.app`)

### Client → Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Click "Add New" → "Project" → Import your GitHub repo
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `cd .. && npm install && npm run build --workspace=shared && npm run build --workspace=client`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_SERVER_URL`: Your Railway server URL (e.g., `https://clubcapy-server.up.railway.app`)
5. Deploy!

### Alternative: Render

Server deployment with `render.yaml` included:
1. Create account at [render.com](https://render.com)
2. Click "New" → "Blueprint" → Connect your repo
3. Render will use `render.yaml` configuration
4. Add `ALLOWED_ORIGINS` env var with your Vercel URL

## License

MIT
