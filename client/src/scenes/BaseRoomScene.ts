import Phaser from 'phaser';
import { Capybara } from '../entities/Capybara';
import { NetworkManager } from '../network/NetworkManager';
import { ChatUI } from '../ui/ChatUI';
import { Player, RoomState, Direction } from 'shared';
import { PORTAL_ZONES, GAME_WIDTH, GAME_HEIGHT } from 'shared';

export abstract class BaseRoomScene extends Phaser.Scene {
  protected abstract roomId: string;
  protected abstract backgroundKey: string;

  protected networkManager!: NetworkManager;
  protected chatUI!: ChatUI;
  protected localPlayer?: Capybara;
  protected remotePlayers: Map<string, Capybara> = new Map();
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected localPlayerData?: Player;
  protected lastSentPosition = { x: 0, y: 0 };
  protected portalCooldown: boolean = false;

  init(data: { networkManager: NetworkManager; chatUI: ChatUI; localPlayerData: Player }): void {
    this.networkManager = data.networkManager;
    this.chatUI = data.chatUI;
    this.localPlayerData = data.localPlayerData;
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.backgroundKey);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.setupNetworkListeners();

    if (this.localPlayerData) {
      this.createLocalPlayer(this.localPlayerData);
    }

    this.chatUI.setVisible(true);
    this.portalCooldown = false;

    setTimeout(() => {
      this.portalCooldown = false;
    }, 500);
  }

  protected createLocalPlayer(playerData: Player): void {
    this.localPlayer = new Capybara(
      this,
      playerData.x,
      playerData.y,
      playerData.id,
      playerData.name,
      true
    );
    this.lastSentPosition = { x: playerData.x, y: playerData.y };
  }

  protected setupNetworkListeners(): void {
    this.networkManager.removeAllListeners();

    this.networkManager.onRoomState((state: RoomState) => {
      this.handleRoomState(state);
    });

    this.networkManager.onPlayerJoined(({ player }) => {
      if (player.id !== this.localPlayerData?.id) {
        this.addRemotePlayer(player);
      }
    });

    this.networkManager.onPlayerLeft(({ playerId }) => {
      this.removeRemotePlayer(playerId);
    });

    this.networkManager.onPlayerMoved(({ playerId, x, y, direction }) => {
      const remote = this.remotePlayers.get(playerId);
      if (remote) {
        remote.updateFromNetwork(x, y, direction);
      }
    });

    this.networkManager.onChatMessage((message) => {
      this.chatUI.addMessage(message.playerName, message.message);
    });
  }

  protected handleRoomState(state: RoomState): void {
    this.remotePlayers.forEach((player) => player.destroy());
    this.remotePlayers.clear();

    state.players.forEach((player) => {
      if (player.id !== this.localPlayerData?.id) {
        this.addRemotePlayer(player);
      } else if (this.localPlayer) {
        this.localPlayer.x = player.x;
        this.localPlayer.y = player.y;
        this.localPlayerData = player;
      }
    });

    state.recentMessages.forEach((msg) => {
      this.chatUI.addMessage(msg.playerName, msg.message, false);
    });
  }

  protected addRemotePlayer(player: Player): void {
    const remote = new Capybara(
      this,
      player.x,
      player.y,
      player.id,
      player.name,
      false
    );
    remote.setDirection(player.direction);
    this.remotePlayers.set(player.id, remote);
  }

  protected removeRemotePlayer(playerId: string): void {
    const remote = this.remotePlayers.get(playerId);
    if (remote) {
      remote.destroy();
      this.remotePlayers.delete(playerId);
    }
  }

  update(): void {
    if (this.localPlayer) {
      this.localPlayer.update(this.cursors);
      this.sendPositionUpdate();
      this.checkPortals();
    }

    this.remotePlayers.forEach((player) => player.update());
  }

  protected sendPositionUpdate(): void {
    if (!this.localPlayer) return;

    const pos = this.localPlayer.getPosition();
    const dx = Math.abs(pos.x - this.lastSentPosition.x);
    const dy = Math.abs(pos.y - this.lastSentPosition.y);

    if (dx > 2 || dy > 2) {
      this.networkManager.sendMove(pos.x, pos.y, this.localPlayer.currentDirection);
      this.lastSentPosition = { x: pos.x, y: pos.y };
    }
  }

  protected checkPortals(): void {
    if (!this.localPlayer || this.portalCooldown) return;

    const portals = PORTAL_ZONES[this.roomId];
    if (!portals) return;

    const playerX = this.localPlayer.x;
    const playerY = this.localPlayer.y;

    for (const portal of portals) {
      const zone = portal.zone;
      if (
        playerX >= zone.x &&
        playerX <= zone.x + zone.width &&
        playerY >= zone.y &&
        playerY <= zone.y + zone.height
      ) {
        this.transitionToRoom(portal.targetRoom);
        break;
      }
    }
  }

  protected transitionToRoom(targetRoom: string): void {
    this.portalCooldown = true;
    
    this.networkManager.sendChangeRoom(targetRoom, this.roomId);

    const sceneKey = this.getSceneKeyForRoom(targetRoom);
    
    this.chatUI.clearMessages();

    if (this.localPlayerData) {
      this.localPlayerData.room = targetRoom;
    }

    this.scene.start(sceneKey, {
      networkManager: this.networkManager,
      chatUI: this.chatUI,
      localPlayerData: this.localPlayerData
    });
  }

  protected getSceneKeyForRoom(roomId: string): string {
    const mapping: Record<string, string> = {
      town: 'TownScene',
      beach: 'BeachScene',
      forest: 'ForestScene'
    };
    return mapping[roomId] || 'TownScene';
  }

  shutdown(): void {
    this.remotePlayers.forEach((player) => player.destroy());
    this.remotePlayers.clear();
  }
}
