import { Server, Socket } from 'socket.io';
import {
  ChatMessage,
  RoomState,
  Player,
  ServerToClientEvents,
  ClientToServerEvents
} from '@clubcapy/shared';
import {
  ROOMS,
  ROOM_CONNECTIONS,
  ROOM_SPAWNS,
  MAX_CHAT_HISTORY,
  MAX_MESSAGE_LENGTH
} from '@clubcapy/shared';
import { PlayerManager } from './PlayerManager.js';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

interface RoomData {
  id: string;
  messages: ChatMessage[];
}

export class RoomManager {
  private rooms: Map<string, RoomData> = new Map();
  private io: TypedServer;
  private playerManager: PlayerManager;

  constructor(io: TypedServer, playerManager: PlayerManager) {
    this.io = io;
    this.playerManager = playerManager;
    
    Object.values(ROOMS).forEach(roomId => {
      this.rooms.set(roomId, {
        id: roomId,
        messages: []
      });
    });
  }

  getRoomState(roomId: string): RoomState {
    const room = this.rooms.get(roomId);
    const players = this.playerManager.getPlayersByRoom(roomId);
    
    return {
      roomId,
      players,
      recentMessages: room?.messages || []
    };
  }

  addPlayerToRoom(socket: TypedSocket, player: Player): void {
    socket.join(player.room);
    
    const roomState = this.getRoomState(player.room);
    socket.emit('roomState', roomState);
    
    socket.to(player.room).emit('playerJoined', { player });
    
    console.log(`[${player.room}] ${player.name} joined`);
  }

  removePlayerFromRoom(socket: TypedSocket, player: Player): void {
    socket.leave(player.room);
    socket.to(player.room).emit('playerLeft', { playerId: player.id });
    console.log(`[${player.room}] ${player.name} left`);
  }

  changeRoom(socket: TypedSocket, playerId: string, targetRoom: string, fromRoom?: string): boolean {
    const player = this.playerManager.getPlayer(playerId);
    if (!player) return false;

    const currentRoom = player.room;
    const connections = ROOM_CONNECTIONS[currentRoom];
    
    if (!connections || !connections.includes(targetRoom)) {
      socket.emit('error', `Cannot travel from ${currentRoom} to ${targetRoom}`);
      return false;
    }

    socket.leave(currentRoom);
    socket.to(currentRoom).emit('playerLeft', { playerId: player.id });

    const spawns = ROOM_SPAWNS[targetRoom];
    const spawn = spawns[currentRoom] || spawns['default'];
    
    this.playerManager.updatePlayerRoom(playerId, targetRoom, spawn.x, spawn.y);

    socket.join(targetRoom);
    
    socket.emit('roomChanged', {
      roomId: targetRoom,
      spawnX: spawn.x,
      spawnY: spawn.y
    });

    const updatedPlayer = this.playerManager.getPlayer(playerId);
    if (updatedPlayer) {
      const roomState = this.getRoomState(targetRoom);
      socket.emit('roomState', roomState);
      
      socket.to(targetRoom).emit('playerJoined', {
        player: {
          id: updatedPlayer.id,
          name: updatedPlayer.name,
          x: updatedPlayer.x,
          y: updatedPlayer.y,
          direction: updatedPlayer.direction,
          room: updatedPlayer.room
        }
      });
    }

    console.log(`[${currentRoom} -> ${targetRoom}] ${player.name} changed rooms`);
    return true;
  }

  broadcastMove(socket: TypedSocket, playerId: string, x: number, y: number, direction: string): void {
    const player = this.playerManager.getPlayer(playerId);
    if (!player) return;

    socket.to(player.room).emit('playerMoved', {
      playerId,
      x,
      y,
      direction: direction as Player['direction']
    });
  }

  broadcastChat(socket: TypedSocket, playerId: string, message: string): void {
    const player = this.playerManager.getPlayer(playerId);
    if (!player) return;

    const sanitizedMessage = message.slice(0, MAX_MESSAGE_LENGTH).trim();
    if (!sanitizedMessage) return;

    const chatMessage: ChatMessage = {
      playerId,
      playerName: player.name,
      message: sanitizedMessage,
      timestamp: Date.now()
    };

    const room = this.rooms.get(player.room);
    if (room) {
      room.messages.push(chatMessage);
      if (room.messages.length > MAX_CHAT_HISTORY) {
        room.messages.shift();
      }
    }

    this.io.to(player.room).emit('chatMessage', chatMessage);
    console.log(`[${player.room}] ${player.name}: ${sanitizedMessage}`);
  }
}
