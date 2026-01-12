import { BaseRoomScene } from './BaseRoomScene';
import { ROOMS } from 'shared';

export class ForestScene extends BaseRoomScene {
  protected roomId = ROOMS.FOREST;
  protected backgroundKey = 'forest';

  constructor() {
    super({ key: 'ForestScene' });
  }

  create(): void {
    super.create();
  }
}
