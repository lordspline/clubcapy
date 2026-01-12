import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Player,
  RoomState,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  PlayerMovedPayload,
  ChatMessage,
  Direction
} from 'shared';

export class NetworkManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private connected: boolean = false;

  constructor() {
    this.socket = io({
      autoConnect: false
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });
  }

  connect(): Promise<Player> {
    return new Promise((resolve) => {
      this.socket.connect();
      this.socket.emit('join', (player: Player) => {
        resolve(player);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  isConnected(): boolean {
    return this.connected;
  }

  sendMove(x: number, y: number, direction: Direction): void {
    this.socket.emit('move', { x, y, direction });
  }

  sendChat(message: string): void {
    this.socket.emit('chat', { message });
  }

  sendChangeRoom(targetRoom: string, fromRoom: string): void {
    this.socket.emit('changeRoom', { targetRoom, fromRoom });
  }

  onRoomState(callback: (state: RoomState) => void): void {
    this.socket.on('roomState', callback);
  }

  onPlayerJoined(callback: (payload: PlayerJoinedPayload) => void): void {
    this.socket.on('playerJoined', callback);
  }

  onPlayerLeft(callback: (payload: PlayerLeftPayload) => void): void {
    this.socket.on('playerLeft', callback);
  }

  onPlayerMoved(callback: (payload: PlayerMovedPayload) => void): void {
    this.socket.on('playerMoved', callback);
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    this.socket.on('chatMessage', callback);
  }

  removeAllListeners(): void {
    this.socket.off('roomState');
    this.socket.off('playerJoined');
    this.socket.off('playerLeft');
    this.socket.off('playerMoved');
    this.socket.off('chatMessage');
  }
}
