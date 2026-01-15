export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  direction: Direction;
  room: string;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  players: Player[];
  recentMessages: ChatMessage[];
}

export interface MovePayload {
  x: number;
  y: number;
  direction: Direction;
}

export interface ChatPayload {
  message: string;
}

export interface ChangeRoomPayload {
  targetRoom: string;
  fromRoom?: string;
}

export interface JoinPayload {
  name: string;
}

export interface PlayerJoinedPayload {
  player: Player;
}

export interface PlayerLeftPayload {
  playerId: string;
}

export interface PlayerMovedPayload {
  playerId: string;
  x: number;
  y: number;
  direction: Direction;
}

export interface ChatMessagePayload {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface RoomChangedPayload {
  roomId: string;
  spawnX: number;
  spawnY: number;
}

export interface ServerToClientEvents {
  roomState: (state: RoomState) => void;
  playerJoined: (payload: PlayerJoinedPayload) => void;
  playerLeft: (payload: PlayerLeftPayload) => void;
  playerMoved: (payload: PlayerMovedPayload) => void;
  chatMessage: (payload: ChatMessagePayload) => void;
  roomChanged: (payload: RoomChangedPayload) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join: (payload?: JoinPayload) => void;
  move: (payload: MovePayload) => void;
  chat: (payload: ChatPayload) => void;
  changeRoom: (payload: ChangeRoomPayload) => void;
}
