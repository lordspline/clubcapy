import Phaser from 'phaser';
import { Direction, SPRITE_SIZE } from '@clubcapy/shared';

export class Capybara extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private nameTag: Phaser.GameObjects.Text;
  private targetX: number;
  private targetY: number;
  private _direction: Direction = 'down';
  readonly isLocalPlayer: boolean;
  readonly playerId: string;
  readonly playerName: string;

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

    this.sprite = scene.add.sprite(0, 0, 'capybara', 0);
    this.sprite.setOrigin(0.5, 0.5);
    this.add(this.sprite);

    this.nameTag = scene.add.text(0, -SPRITE_SIZE / 2 - 10, playerName, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: isLocalPlayer ? '#FFD700' : '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    this.nameTag.setOrigin(0.5, 1);
    this.add(this.nameTag);

    scene.add.existing(this);

    if (scene.physics && scene.physics.world) {
      scene.physics.world.enable(this);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(SPRITE_SIZE - 8, SPRITE_SIZE - 8);
      body.setOffset(-SPRITE_SIZE / 2 + 4, -SPRITE_SIZE / 2 + 4);
    }

    this.playIdleAnimation();
  }

  get direction(): Direction {
    return this._direction;
  }

  set direction(value: Direction) {
    this._direction = value;
  }

  static createAnimations(scene: Phaser.Scene): void {
    const directions: Direction[] = ['down', 'up', 'left', 'right'];
    const frameRows: Record<Direction, number> = {
      down: 0,
      up: 1,
      left: 2,
      right: 3
    };

    directions.forEach(dir => {
      const row = frameRows[dir];
      
      if (!scene.anims.exists(`idle-${dir}`)) {
        scene.anims.create({
          key: `idle-${dir}`,
          frames: [{ key: 'capybara', frame: row * 4 }],
          frameRate: 1,
          repeat: -1
        });
      }

      if (!scene.anims.exists(`walk-${dir}`)) {
        scene.anims.create({
          key: `walk-${dir}`,
          frames: scene.anims.generateFrameNumbers('capybara', {
            start: row * 4 + 1,
            end: row * 4 + 3
          }),
          frameRate: 8,
          repeat: -1
        });
      }
    });
  }

  playIdleAnimation(): void {
    this.sprite.play(`idle-${this._direction}`, true);
  }

  playWalkAnimation(): void {
    this.sprite.play(`walk-${this._direction}`, true);
  }

  move(velocityX: number, velocityY: number): void {
    if (!this.body) return;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
      if (Math.abs(velocityX) > Math.abs(velocityY)) {
        this._direction = velocityX > 0 ? 'right' : 'left';
      } else {
        this._direction = velocityY > 0 ? 'down' : 'up';
      }
      this.playWalkAnimation();
    } else {
      this.playIdleAnimation();
    }
  }

  setTargetPosition(x: number, y: number, direction: Direction): void {
    this.targetX = x;
    this.targetY = y;
    this._direction = direction;
  }

  updateInterpolation(_delta: number): void {
    if (this.isLocalPlayer) return;

    const lerpFactor = 0.15;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 2) {
      this.x += dx * lerpFactor;
      this.y += dy * lerpFactor;
      this.playWalkAnimation();
    } else {
      this.x = this.targetX;
      this.y = this.targetY;
      this.playIdleAnimation();
    }
  }

  stopMovement(): void {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
    this.playIdleAnimation();
  }

  setPosition(x: number, y?: number): this {
    super.setPosition(x, y);
    this.targetX = x;
    this.targetY = y ?? this.y;
    return this;
  }
}
