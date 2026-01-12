import { BaseRoomScene } from './BaseRoomScene';
import { ROOMS } from 'shared';

export class BeachScene extends BaseRoomScene {
  protected roomId = ROOMS.BEACH;
  protected backgroundKey = 'beach';

  constructor() {
    super({ key: 'BeachScene' });
  }

  create(): void {
    super.create();
  }
}
