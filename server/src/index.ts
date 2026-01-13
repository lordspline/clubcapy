import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  MovePayload,
  ChatPayload,
  ChangeRoomPayload,
  Direction
} from '@clubcapy/shared';
import { PlayerManager } from './PlayerManager.js';
import { RoomManager } from './RoomManager.js';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  }
});

const playerManager = new PlayerManager();
const roomManager = new RoomManager(io, playerManager);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', players: playerManager.getAllPlayers().length });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join', (payload) => {
    const player = playerManager.createPlayer(socket.id, payload?.name);
    roomManager.addPlayerToRoom(socket, player);
  });

  socket.on('move', (payload: MovePayload) => {
    const player = playerManager.getPlayer(socket.id);
    if (!player) return;

    playerManager.updatePlayerPosition(
      socket.id,
      payload.x,
      payload.y,
      payload.direction as Direction
    );
    
    roomManager.broadcastMove(socket, socket.id, payload.x, payload.y, payload.direction);
  });

  socket.on('chat', (payload: ChatPayload) => {
    roomManager.broadcastChat(socket, socket.id, payload.message);
  });

  socket.on('changeRoom', (payload: ChangeRoomPayload) => {
    roomManager.changeRoom(socket, socket.id, payload.targetRoom, payload.fromRoom);
  });

  socket.on('disconnect', () => {
    const player = playerManager.getPlayer(socket.id);
    if (player) {
      roomManager.removePlayerFromRoom(socket, player);
      playerManager.removePlayer(socket.id);
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`ClubCapy server running on port ${PORT}`);
});
