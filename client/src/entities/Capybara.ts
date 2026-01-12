import Phaser from 'phaser';
import { Direction } from 'shared';
import { SPRITE_SIZE, PLAYER_SPEED } from 'shared';

export class Capybara extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public nametag: Phaser.GameObjects.Text;
  public isLocalPlayer: boolean;
  public playerId: string;
  public playerName: string;
  public currentDirection: Direction = 'down';

  private targetX: number = 0;
  private targetY: number = 0;
  private interpolating: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: string,
    playerName: string,
    isLocalPlayer: boolean = false
  ) {
    super(scene, x, y);

    this.playerId = playerId;
    this.playerName = playerName;
    this.isLocalPlayer = isLocalPlayer;
    this.targetX = x;
    this.targetY = y;

    this.sprite = scene.add.sprite(0, 0, 'capybara');
    this.sprite.setOrigin(0.5, 0.5);
    this.add(this.sprite);

    this.nametag = scene.add.text(0, -SPRITE_SIZE / 2 - 10, playerName, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    this.nametag.setOrigin(0.5, 1);
    this.add(this.nametag);

    scene.add.existing(this);

    this.playAnimation('idle-down');
  }

  playAnimation(key: string): void {
    if (this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.play(key, true);
    }
  }

  setDirection(direction: Direction): void {
    this.currentDirection = direction;
  }

  updateFromNetwork(x: number, y: number, direction: Direction): void {
    this.targetX = x;
    this.targetY = y;
    this.currentDirection = direction;
    this.interpolating = true;
    this.playAnimation(`walk-${direction}`);
  }

  update(cursors?: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.isLocalPlayer && cursors) {
      this.handleLocalMovement(cursors);
    } else if (this.interpolating) {
      this.interpolatePosition();
    }
  }

  private handleLocalMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    let velocityX = 0;
    let velocityY = 0;
    let newDirection: Direction | null = null;

    if (cursors.left.isDown) {
      velocityX = -PLAYER_SPEED;
      newDirection = 'left';
    } else if (cursors.right.isDown) {
      velocityX = PLAYER_SPEED;
      newDirection = 'right';
    }

    if (cursors.up.isDown) {
      velocityY = -PLAYER_SPEED;
      newDirection = 'up';
    } else if (cursors.down.isDown) {
      velocityY = PLAYER_SPEED;
      newDirection = 'down';
    }

    const delta = this.scene.game.loop.delta / 1000;
    
    if (velocityX !== 0 || velocityY !== 0) {
      this.x += velocityX * delta;
      this.y += velocityY * delta;

      this.x = Phaser.Math.Clamp(this.x, SPRITE_SIZE / 2, 800 - SPRITE_SIZE / 2);
      this.y = Phaser.Math.Clamp(this.y, SPRITE_SIZE / 2, 600 - SPRITE_SIZE / 2);

      if (newDirection) {
        this.currentDirection = newDirection;
        this.playAnimation(`walk-${newDirection}`);
      }
    } else {
      this.playAnimation(`idle-${this.currentDirection}`);
    }
  }

  private interpolatePosition(): void {
    const speed = PLAYER_SPEED * 1.5;
    const delta = this.scene.game.loop.delta / 1000;
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.interpolating = false;
      this.playAnimation(`idle-${this.currentDirection}`);
    } else {
      const moveDistance = Math.min(speed * delta, distance);
      this.x += (dx / distance) * moveDistance;
      this.y += (dy / distance) * moveDistance;
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
