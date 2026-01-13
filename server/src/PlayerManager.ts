import { Player, Direction } from '@clubcapy/shared';

interface PlayerData extends Player {
  socketId: string;
}

const adjectives = ['Happy', 'Sleepy', 'Chill', 'Cozy', 'Sunny', 'Lazy', 'Fluffy', 'Brave', 'Swift', 'Calm'];
const nouns = ['Capy', 'Bara', 'Splash', 'Snoot', 'Bean', 'Mochi', 'Pudge', 'Nugget', 'Sprout', 'Bubble'];

export class PlayerManager {
  private players: Map<string, PlayerData> = new Map();

  generateName(): string {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${adj}${noun}_${num}`;
  }

  createPlayer(socketId: string, name?: string): PlayerData {
    const player: PlayerData = {
      id: socketId,
      socketId,
      name: name || this.generateName(),
      x: 400,
      y: 300,
      direction: 'down' as Direction,
      room: 'town'
    };
    this.players.set(socketId, player);
    return player;
  }

  getPlayer(socketId: string): PlayerData | undefined {
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

  removePlayer(socketId: string): PlayerData | undefined {
    const player = this.players.get(socketId);
    if (player) {
      this.players.delete(socketId);
    }
    return player;
  }

  getPlayersByRoom(room: string): Player[] {
    const players: Player[] = [];
    this.players.forEach(player => {
      if (player.room === room) {
        players.push({
          id: player.id,
          name: player.name,
          x: player.x,
          y: player.y,
          direction: player.direction,
          room: player.room
        });
      }
    });
    return players;
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      direction: p.direction,
      room: p.room
    }));
  }
}
