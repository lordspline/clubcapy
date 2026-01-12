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
  fromRoom: string;
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

export interface ChatMessagePayload extends ChatMessage {}

export interface ServerToClientEvents {
  roomState: (state: RoomState) => void;
  playerJoined: (payload: PlayerJoinedPayload) => void;
  playerLeft: (payload: PlayerLeftPayload) => void;
  playerMoved: (payload: PlayerMovedPayload) => void;
  chatMessage: (payload: ChatMessagePayload) => void;
}

export interface ClientToServerEvents {
  join: (callback: (player: Player) => void) => void;
  move: (payload: MovePayload) => void;
  chat: (payload: ChatPayload) => void;
  changeRoom: (payload: ChangeRoomPayload) => void;
}
