import Phaser from 'phaser';
import { Capybara } from '../entities/Capybara';
import { NetworkManager } from '../network/NetworkManager';
import { ChatUI } from '../ui/ChatUI';
import {
  Player,
  RoomState,
  ChatMessage,
  Direction,
  PLAYER_SPEED,
  PORTAL_ZONES,
  ROOM_BOUNDS
} from '@clubcapy/shared';

interface Portal {
  zone: Phaser.GameObjects.Zone;
  target: string;
}

export abstract class BaseRoomScene extends Phaser.Scene {
  protected networkManager!: NetworkManager;
  protected chatUI!: ChatUI;
  protected localPlayer?: Capybara;
  protected remotePlayers: Map<string, Capybara> = new Map();
  protected cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  protected portals: Portal[] = [];
  protected roomId: string;
  protected background?: Phaser.GameObjects.Image;
  protected lastSentPosition = { x: 0, y: 0 };
  protected localPlayerId?: string;
  protected localPlayerName?: string;
  protected spawnX: number = 400;
  protected spawnY: number = 300;

  constructor(key: string, roomId: string) {
    super({ key });
    this.roomId = roomId;
  }

  init(data: { spawnX?: number; spawnY?: number; playerId?: string; playerName?: string }): void {
    if (data.spawnX !== undefined) this.spawnX = data.spawnX;
    if (data.spawnY !== undefined) this.spawnY = data.spawnY;
    if (data.playerId) this.localPlayerId = data.playerId;
    if (data.playerName) this.localPlayerName = data.playerName;
  }

  create(): void {
    this.networkManager = NetworkManager.getInstance();
    
    this.chatUI = ChatUI.getInstance('game-container');
    this.chatUI.setRoom(this.roomId);

    this.createBackground();
    this.createPortals();
    
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.setupNetworkHandlers();

    if (this.localPlayerId && this.localPlayerName) {
      this.createLocalPlayer(this.localPlayerId, this.localPlayerName, this.spawnX, this.spawnY);
    }
  }

  protected abstract createBackground(): void;

  protected createPortals(): void {
    const portalDefs = PORTAL_ZONES[this.roomId] || [];
    
    portalDefs.forEach(def => {
      const zone = this.add.zone(def.x + def.width / 2, def.y + def.height / 2, def.width, def.height);
      this.physics.world.enable(zone);
      (zone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (zone.body as Phaser.Physics.Arcade.Body).moves = false;
      
      this.portals.push({ zone, target: def.target });
    });
  }

  protected setupNetworkHandlers(): void {
    this.networkManager.onRoomState((state: RoomState) => {
      this.handleRoomState(state);
    });

    this.networkManager.onPlayerJoined((player: Player) => {
      if (player.id !== this.localPlayerId) {
        this.addRemotePlayer(player);
        this.chatUI.addSystemMessage(`${player.name} joined the room`);
        this.updatePlayerCount();
      }
    });

    this.networkManager.onPlayerLeft((playerId: string) => {
      const player = this.remotePlayers.get(playerId);
      if (player) {
        this.chatUI.addSystemMessage(`${player.playerName} left the room`);
        player.destroy();
        this.remotePlayers.delete(playerId);
        this.updatePlayerCount();
      }
    });

    this.networkManager.onPlayerMoved((playerId: string, x: number, y: number, direction: Direction) => {
      const player = this.remotePlayers.get(playerId);
      if (player) {
        player.setTargetPosition(x, y, direction);
      }
    });

    this.networkManager.onChatMessage((message: ChatMessage) => {
      this.chatUI.addMessage(message);
    });

    this.networkManager.onRoomChanged((roomId: string, spawnX: number, spawnY: number) => {
      const sceneKey = this.getSceneKeyForRoom(roomId);
      this.scene.start(sceneKey, {
        spawnX,
        spawnY,
        playerId: this.localPlayerId,
        playerName: this.localPlayerName
      });
    });
  }

  protected handleRoomState(state: RoomState): void {
    this.remotePlayers.forEach(player => player.destroy());
    this.remotePlayers.clear();

    const myId = this.networkManager.getSocketId();
    
    state.players.forEach(player => {
      if (player.id === myId) {
        this.localPlayerId = player.id;
        this.localPlayerName = player.name;
        if (!this.localPlayer) {
          this.createLocalPlayer(player.id, player.name, player.x, player.y);
        }
      } else {
        this.addRemotePlayer(player);
      }
    });

    this.chatUI.loadMessages(state.recentMessages);
    this.updatePlayerCount();
  }

  protected createLocalPlayer(id: string, name: string, x: number, y: number): void {
    this.localPlayer = new Capybara(this, x, y, id, name, true);
    this.localPlayerId = id;
    this.localPlayerName = name;
    this.lastSentPosition = { x, y };

    this.portals.forEach(portal => {
      this.physics.add.overlap(this.localPlayer!, portal.zone, () => {
        this.handlePortalOverlap(portal.target);
      });
    });
  }

  protected addRemotePlayer(player: Player): void {
    if (this.remotePlayers.has(player.id)) return;
    
    const capybara = new Capybara(this, player.x, player.y, player.id, player.name, false);
    capybara.direction = player.direction;
    this.remotePlayers.set(player.id, capybara);
  }

  protected handlePortalOverlap(targetRoom: string): void {
    if (!this.localPlayer) return;
    
    this.localPlayer.stopMovement();
    this.networkManager.sendChangeRoom(targetRoom, this.roomId);
  }

  protected getSceneKeyForRoom(roomId: string): string {
    const sceneMap: Record<string, string> = {
      town: 'TownScene',
      beach: 'BeachScene',
      forest: 'ForestScene'
    };
    return sceneMap[roomId] || 'TownScene';
  }

  protected updatePlayerCount(): void {
    const count = 1 + this.remotePlayers.size;
    this.chatUI.setPlayerCount(count);
  }

  update(_time: number, delta: number): void {
    this.updateLocalPlayer();
    this.updateRemotePlayers(delta);
  }

  protected updateLocalPlayer(): void {
    if (!this.localPlayer || !this.cursors || this.chatUI.isInputFocused()) {
      if (this.localPlayer) {
        this.localPlayer.move(0, 0);
      }
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -PLAYER_SPEED;
    } else if (this.cursors.right.isDown) {
      velocityX = PLAYER_SPEED;
    }

    if (this.cursors.up.isDown) {
      velocityY = -PLAYER_SPEED;
    } else if (this.cursors.down.isDown) {
      velocityY = PLAYER_SPEED;
    }

    this.localPlayer.move(velocityX, velocityY);

    const bounds = ROOM_BOUNDS[this.roomId];
    if (bounds) {
      this.localPlayer.x = Phaser.Math.Clamp(this.localPlayer.x, bounds.minX, bounds.maxX);
      this.localPlayer.y = Phaser.Math.Clamp(this.localPlayer.y, bounds.minY, bounds.maxY);
    }

    const dx = Math.abs(this.localPlayer.x - this.lastSentPosition.x);
    const dy = Math.abs(this.localPlayer.y - this.lastSentPosition.y);
    
    if (dx > 2 || dy > 2) {
      this.networkManager.sendMove(
        Math.round(this.localPlayer.x),
        Math.round(this.localPlayer.y),
        this.localPlayer.direction
      );
      this.lastSentPosition = { x: this.localPlayer.x, y: this.localPlayer.y };
    }
  }

  protected updateRemotePlayers(delta: number): void {
    this.remotePlayers.forEach(player => {
      player.updateInterpolation(delta);
    });
  }

  shutdown(): void {
    if (this.localPlayer) {
      this.localPlayer.destroy();
      this.localPlayer = undefined;
    }
    this.remotePlayers.forEach(player => player.destroy());
    this.remotePlayers.clear();
    this.portals = [];
  }
}
