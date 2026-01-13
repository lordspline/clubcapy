import { BaseRoomScene } from './BaseRoomScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@clubcapy/shared';

export class TownScene extends BaseRoomScene {
  constructor() {
    super('TownScene', 'town');
  }

  protected createBackground(): void {
    this.background = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'town');
    this.background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
  }
}
