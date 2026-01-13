import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TownScene } from './scenes/TownScene';
import { BeachScene } from './scenes/BeachScene';
import { ForestScene } from './scenes/ForestScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@clubcapy/shared';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TownScene, BeachScene, ForestScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
