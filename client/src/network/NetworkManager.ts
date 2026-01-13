import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Player,
  RoomState,
  ChatMessage,
  Direction
} from '@clubcapy/shared';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class NetworkManager {
  private static instance: NetworkManager;
  socket: TypedSocket;
  private connected: boolean = false;
  
  private onPlayerJoinedCallback?: (player: Player) => void;
  private onPlayerLeftCallback?: (playerId: string) => void;
  private onPlayerMovedCallback?: (playerId: string, x: number, y: number, direction: Direction) => void;
  private onChatMessageCallback?: (message: ChatMessage) => void;
  private onRoomStateCallback?: (state: RoomState) => void;
  private onRoomChangedCallback?: (roomId: string, spawnX: number, spawnY: number) => void;
  private onErrorCallback?: (message: string) => void;

  private constructor() {
    const serverUrl = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;
    this.socket = io(serverUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private setupEventHandlers(): void {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });

    this.socket.on('roomState', (state: RoomState) => {
      console.log('Received room state:', state);
      this.onRoomStateCallback?.(state);
    });

    this.socket.on('playerJoined', (payload) => {
      console.log('Player joined:', payload.player);
      this.onPlayerJoinedCallback?.(payload.player);
    });

    this.socket.on('playerLeft', (payload) => {
      console.log('Player left:', payload.playerId);
      this.onPlayerLeftCallback?.(payload.playerId);
    });

    this.socket.on('playerMoved', (payload) => {
      this.onPlayerMovedCallback?.(payload.playerId, payload.x, payload.y, payload.direction);
    });

    this.socket.on('chatMessage', (payload) => {
      console.log('Chat message:', payload);
      this.onChatMessageCallback?.(payload);
    });

    this.socket.on('roomChanged', (payload) => {
      console.log('Room changed:', payload);
      this.onRoomChangedCallback?.(payload.roomId, payload.spawnX, payload.spawnY);
    });

    this.socket.on('error', (message: string) => {
      console.error('Server error:', message);
      this.onErrorCallback?.(message);
    });
  }

  connect(): void {
    if (!this.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  join(name?: string): void {
    this.socket.emit('join', name ? { name } : undefined);
  }

  sendMove(x: number, y: number, direction: Direction): void {
    this.socket.emit('move', { x, y, direction });
  }

  sendChat(message: string): void {
    this.socket.emit('chat', { message });
  }

  sendChangeRoom(targetRoom: string, fromRoom?: string): void {
    this.socket.emit('changeRoom', { targetRoom, fromRoom });
  }

  onPlayerJoined(callback: (player: Player) => void): void {
    this.onPlayerJoinedCallback = callback;
  }

  onPlayerLeft(callback: (playerId: string) => void): void {
    this.onPlayerLeftCallback = callback;
  }

  onPlayerMoved(callback: (playerId: string, x: number, y: number, direction: Direction) => void): void {
    this.onPlayerMovedCallback = callback;
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    this.onChatMessageCallback = callback;
  }

  onRoomState(callback: (state: RoomState) => void): void {
    this.onRoomStateCallback = callback;
  }

  onRoomChanged(callback: (roomId: string, spawnX: number, spawnY: number) => void): void {
    this.onRoomChangedCallback = callback;
  }

  onError(callback: (message: string) => void): void {
    this.onErrorCallback = callback;
  }

  getSocketId(): string {
    return this.socket.id || '';
  }

  isConnected(): boolean {
    return this.connected;
  }
}
