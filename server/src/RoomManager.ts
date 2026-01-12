import { ChatMessage, RoomState, Player } from 'shared';
import { MAX_CHAT_HISTORY, ROOM_CONNECTIONS, ROOM_SPAWNS, ROOMS } from 'shared';

interface RoomData {
  messages: ChatMessage[];
}

export class RoomManager {
  private rooms: Map<string, RoomData> = new Map();

  constructor() {
    Object.values(ROOMS).forEach(roomId => {
      this.rooms.set(roomId, { messages: [] });
    });
  }

  addMessage(roomId: string, message: ChatMessage): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.messages.push(message);
      if (room.messages.length > MAX_CHAT_HISTORY) {
        room.messages.shift();
      }
    }
  }

  getRecentMessages(roomId: string): ChatMessage[] {
    return this.rooms.get(roomId)?.messages || [];
  }

  getRoomState(roomId: string, players: Player[]): RoomState {
    return {
      roomId,
      players,
      recentMessages: this.getRecentMessages(roomId)
    };
  }

  canTransition(fromRoom: string, toRoom: string): boolean {
    const connections = ROOM_CONNECTIONS[fromRoom];
    return connections ? connections.includes(toRoom) : false;
  }

  getSpawnPosition(roomId: string, fromRoom?: string): { x: number; y: number } {
    const spawns = ROOM_SPAWNS[roomId];
    if (spawns && fromRoom && spawns[fromRoom]) {
      return spawns[fromRoom];
    }
    return spawns?.default || { x: 400, y: 300 };
  }
}
