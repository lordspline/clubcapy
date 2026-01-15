import Phaser from 'phaser';
import { Capybara } from '../entities/Capybara';

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

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading ClubCapy...', {
      fontSize: '24px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4CAF50, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.load.spritesheet('capybara', 'assets/capybara.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 2,
      spacing: 4
    });

    this.load.image('town', 'assets/rooms/town.png');
    this.load.image('beach', 'assets/rooms/beach.png');
    this.load.image('forest', 'assets/rooms/forest.png');
  }

  create(): void {
    Capybara.createAnimations(this);
    this.scene.start('TownScene');
  }
}
