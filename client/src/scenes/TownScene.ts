import { BaseRoomScene } from './BaseRoomScene';
import { NetworkManager } from '../network/NetworkManager';
import { ChatUI } from '../ui/ChatUI';
import { Player } from 'shared';
import { ROOMS, ROOM_SPAWNS } from 'shared';

export class TownScene extends BaseRoomScene {
  protected roomId = ROOMS.TOWN;
  protected backgroundKey = 'town';

  constructor() {
    super({ key: 'TownScene' });
  }

  init(data: { networkManager?: NetworkManager; chatUI?: ChatUI; localPlayerData?: Player }): void {
    if (data.networkManager && data.chatUI && data.localPlayerData) {
      super.init(data as { networkManager: NetworkManager; chatUI: ChatUI; localPlayerData: Player });
    }
  }

  async create(): Promise<void> {
    if (!this.networkManager) {
      this.networkManager = new NetworkManager();
      this.chatUI = new ChatUI(this.game.canvas.parentElement!);
      
      this.chatUI.onSendMessage((message) => {
        this.networkManager.sendChat(message);
      });

      const player = await this.networkManager.connect();
      this.localPlayerData = player;
    }

    super.create();
  }
}
