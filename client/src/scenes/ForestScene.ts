import { BaseRoomScene } from './BaseRoomScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@clubcapy/shared';

export class ForestScene extends BaseRoomScene {
  constructor() {
    super('ForestScene', 'forest');
  }

  protected createBackground(): void {
    this.background = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'forest');
    this.background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
  }
}
