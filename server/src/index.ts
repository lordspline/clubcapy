import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PlayerManager } from './PlayerManager.js';
import { RoomManager } from './RoomManager.js';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  MovePayload,
  ChatPayload,
  ChangeRoomPayload,
  ChatMessage
} from 'shared';
import { ROOMS, MAX_MESSAGE_LENGTH } from 'shared';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const playerManager = new PlayerManager();
const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('join', (callback) => {
    const spawnPos = roomManager.getSpawnPosition(ROOMS.TOWN);
    const player = playerManager.createPlayer(socket.id, ROOMS.TOWN, spawnPos.x, spawnPos.y);
    
    socket.join(ROOMS.TOWN);
    
    const playersInRoom = playerManager.getPlayersInRoom(ROOMS.TOWN);
    const roomState = roomManager.getRoomState(ROOMS.TOWN, playersInRoom);
    
    socket.emit('roomState', roomState);
    
    socket.to(ROOMS.TOWN).emit('playerJoined', { player });
    
    callback(player);
    
    console.log(`${player.name} joined ${ROOMS.TOWN}`);
  });

  socket.on('move', (payload: MovePayload) => {
    const player = playerManager.getPlayer(socket.id);
    if (!player) return;

    playerManager.updatePlayerPosition(socket.id, payload.x, payload.y, payload.direction);
    
    socket.to(player.room).emit('playerMoved', {
      playerId: socket.id,
      x: payload.x,
      y: payload.y,
      direction: payload.direction
    });
  });

  socket.on('chat', (payload: ChatPayload) => {
    const player = playerManager.getPlayer(socket.id);
    if (!player) return;

    const message = payload.message.slice(0, MAX_MESSAGE_LENGTH);
    
    const chatMessage: ChatMessage = {
      playerId: socket.id,
      playerName: player.name,
      message,
      timestamp: Date.now()
    };

    roomManager.addMessage(player.room, chatMessage);
    
    io.to(player.room).emit('chatMessage', chatMessage);
  });

  socket.on('changeRoom', (payload: ChangeRoomPayload) => {
    const player = playerManager.getPlayer(socket.id);
    if (!player) return;

    const { targetRoom, fromRoom } = payload;
    
    if (!roomManager.canTransition(fromRoom, targetRoom)) {
      console.log(`Invalid room transition: ${fromRoom} -> ${targetRoom}`);
      return;
    }

    socket.leave(fromRoom);
    socket.to(fromRoom).emit('playerLeft', { playerId: socket.id });
    
    const spawnPos = roomManager.getSpawnPosition(targetRoom, fromRoom);
    playerManager.updatePlayerRoom(socket.id, targetRoom, spawnPos.x, spawnPos.y);
    
    socket.join(targetRoom);
    
    const playersInRoom = playerManager.getPlayersInRoom(targetRoom);
    const roomState = roomManager.getRoomState(targetRoom, playersInRoom);
    socket.emit('roomState', roomState);
    
    const updatedPlayer = playerManager.getPlayer(socket.id);
    if (updatedPlayer) {
      socket.to(targetRoom).emit('playerJoined', { player: updatedPlayer });
    }

    console.log(`${player.name} moved from ${fromRoom} to ${targetRoom}`);
  });

  socket.on('disconnect', () => {
    const player = playerManager.removePlayer(socket.id);
    if (player) {
      io.to(player.room).emit('playerLeft', { playerId: socket.id });
      console.log(`${player.name} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`ClubCapy server running on port ${PORT}`);
});
