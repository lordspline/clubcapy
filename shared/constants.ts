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
    default: { x: 400, y: 450 },
    town: { x: 400, y: 500 }
  }
};

export const PORTAL_ZONES: Record<string, { targetRoom: string; zone: { x: number; y: number; width: number; height: number } }[]> = {
  town: [
    { targetRoom: 'beach', zone: { x: 0, y: 200, width: 50, height: 200 } },
    { targetRoom: 'forest', zone: { x: 300, y: 0, width: 200, height: 50 } }
  ],
  beach: [
    { targetRoom: 'town', zone: { x: 750, y: 200, width: 50, height: 200 } }
  ],
  forest: [
    { targetRoom: 'town', zone: { x: 300, y: 550, width: 200, height: 50 } }
  ]
};

export const MAX_CHAT_HISTORY = 50;
export const MAX_MESSAGE_LENGTH = 200;
export const PLAYER_SPEED = 150;
export const SPRITE_SIZE = 32;
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
