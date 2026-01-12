import Phaser from 'phaser';
import { SPRITE_SIZE } from 'shared';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x8B7355, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.load.spritesheet('capybara', 'assets/capybara.png', {
      frameWidth: SPRITE_SIZE,
      frameHeight: SPRITE_SIZE
    });

    this.load.image('town', 'assets/rooms/town.png');
    this.load.image('beach', 'assets/rooms/beach.png');
    this.load.image('forest', 'assets/rooms/forest.png');
  }

  create(): void {
    this.createAnimations();
    this.scene.start('TownScene');
  }

  private createAnimations(): void {
    const directions = ['down', 'up', 'left', 'right'];
    
    directions.forEach((dir, rowIndex) => {
      this.anims.create({
        key: `idle-${dir}`,
        frames: [{ key: 'capybara', frame: rowIndex * 4 }],
        frameRate: 1,
        repeat: -1
      });

      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers('capybara', {
          start: rowIndex * 4 + 1,
          end: rowIndex * 4 + 3
        }),
        frameRate: 8,
        repeat: -1
      });
    });
  }
}
