import { BaseRoomScene } from './BaseRoomScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@clubcapy/shared';

export class BeachScene extends BaseRoomScene {
  constructor() {
    super('BeachScene', 'beach');
  }

  protected createBackground(): void {
    this.background = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'beach');
    this.background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
  }
}
