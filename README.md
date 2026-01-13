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

## License

MIT
