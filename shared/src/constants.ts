export const ROOMS = {
  TOWN: 'town',
  BEACH: 'beach',
  FOREST: 'forest'
} as const;

export type RoomId = typeof ROOMS[keyof typeof ROOMS];

export const ROOM_CONNECTIONS: Record<string, string[]> = {
  town: ['beach', 'forest'],
  beach: ['town'],
  forest: ['town']
};

export const ROOM_SPAWNS: Record<string, Record<string, { x: number; y: number }>> = {
  town: {
    default: { x: 400, y: 300 },
    beach: { x: 100, y: 300 },
    forest: { x: 400, y: 100 }
  },
  beach: {
    default: { x: 200, y: 300 },
    town: { x: 700, y: 300 }
  },
  forest: {
    default: { x: 400, y: 400 },
    town: { x: 400, y: 500 }
  }
};

export const PORTAL_ZONES: Record<string, Array<{ target: string; x: number; y: number; width: number; height: number }>> = {
  town: [
    { target: 'beach', x: 0, y: 200, width: 50, height: 200 },
    { target: 'forest', x: 300, y: 0, width: 200, height: 50 }
  ],
  beach: [
    { target: 'town', x: 750, y: 200, width: 50, height: 200 }
  ],
  forest: [
    { target: 'town', x: 300, y: 550, width: 200, height: 50 }
  ]
};

export const ROOM_BOUNDS: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {
  town: { minX: 50, maxX: 750, minY: 50, maxY: 550 },
  beach: { minX: 50, maxX: 750, minY: 100, maxY: 550 },
  forest: { minX: 100, maxX: 700, minY: 100, maxY: 550 }
};

export const MAX_CHAT_HISTORY = 50;
export const MAX_MESSAGE_LENGTH = 200;
export const PLAYER_SPEED = 150;
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const SPRITE_SIZE = 48;
