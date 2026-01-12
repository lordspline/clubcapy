import { Player, Direction } from 'shared';

const adjectives = ['Happy', 'Sleepy', 'Fluffy', 'Cozy', 'Chill', 'Sunny', 'Lazy', 'Zen', 'Mellow', 'Groovy'];
const nouns = ['Capy', 'Bara', 'Splash', 'Nap', 'Munch', 'Waddle', 'Float', 'Snoot', 'Bean', 'Loaf'];

function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}

export class PlayerManager {
  private players: Map<string, Player> = new Map();

  createPlayer(socketId: string, room: string, x: number, y: number): Player {
    const player: Player = {
      id: socketId,
      name: generateRandomName(),
      x,
      y,
      direction: 'down',
      room
    };
    this.players.set(socketId, player);
    return player;
  }

  getPlayer(socketId: string): Player | undefined {
    return this.players.get(socketId);
  }

  updatePlayerPosition(socketId: string, x: number, y: number, direction: Direction): void {
    const player = this.players.get(socketId);
    if (player) {
      player.x = x;
      player.y = y;
      player.direction = direction;
    }
  }

  updatePlayerRoom(socketId: string, room: string, x: number, y: number): void {
    const player = this.players.get(socketId);
    if (player) {
      player.room = room;
      player.x = x;
      player.y = y;
    }
  }

  removePlayer(socketId: string): Player | undefined {
    const player = this.players.get(socketId);
    this.players.delete(socketId);
    return player;
  }

  getPlayersInRoom(room: string): Player[] {
    return Array.from(this.players.values()).filter(p => p.room === room);
  }
}
