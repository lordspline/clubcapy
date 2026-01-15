import Phaser from 'phaser';

type PortalDirection = 'left' | 'right' | 'up' | 'down';

interface PortalDef {
  target: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PortalIndicator extends Phaser.GameObjects.Container {
  private arrow: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private direction: PortalDirection;

  constructor(scene: Phaser.Scene, portalDef: PortalDef) {
    const direction = PortalIndicator.getDirection(portalDef);
    const position = PortalIndicator.getIndicatorPosition(portalDef, direction);
    
    super(scene, position.x, position.y);
    
    this.direction = direction;
    this.arrow = this.createArrow();
    this.label = this.createLabel(portalDef.target);
    
    this.add([this.arrow, this.label]);
    this.setDepth(5);
    
    this.createAnimations();
  }

  private static getDirection(portalDef: PortalDef): PortalDirection {
    if (portalDef.x <= 10) return 'left';
    if (portalDef.x >= 740) return 'right';
    if (portalDef.y <= 10) return 'up';
    return 'down';
  }

  private static getIndicatorPosition(portalDef: PortalDef, direction: PortalDirection): { x: number; y: number } {
    const centerX = portalDef.x + portalDef.width / 2;
    const centerY = portalDef.y + portalDef.height / 2;
    
    switch (direction) {
      case 'left':
        return { x: portalDef.x + 40, y: centerY };
      case 'right':
        return { x: portalDef.x + portalDef.width - 40, y: centerY };
      case 'up':
        return { x: centerX, y: portalDef.y + 45 };
      case 'down':
        return { x: centerX, y: portalDef.y + portalDef.height - 45 };
    }
  }

  private createArrow(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const size = 16;
    
    graphics.lineStyle(2, 0x000000, 0.3);
    graphics.fillStyle(0xffffff, 0.9);
    
    switch (this.direction) {
      case 'left':
        graphics.beginPath();
        graphics.moveTo(-size, 0);
        graphics.lineTo(size / 2, -size);
        graphics.lineTo(size / 2, size);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;
      case 'right':
        graphics.beginPath();
        graphics.moveTo(size, 0);
        graphics.lineTo(-size / 2, -size);
        graphics.lineTo(-size / 2, size);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;
      case 'up':
        graphics.beginPath();
        graphics.moveTo(0, -size);
        graphics.lineTo(-size, size / 2);
        graphics.lineTo(size, size / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;
      case 'down':
        graphics.beginPath();
        graphics.moveTo(0, size);
        graphics.lineTo(-size, -size / 2);
        graphics.lineTo(size, -size / 2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
        break;
    }
    
    return graphics;
  }

  private createLabel(target: string): Phaser.GameObjects.Text {
    const formattedText = `To ${target.charAt(0).toUpperCase() + target.slice(1)}`;
    
    const offsetX = this.direction === 'left' ? 25 : this.direction === 'right' ? -25 : 0;
    const offsetY = this.direction === 'up' ? 22 : this.direction === 'down' ? -22 : 0;
    
    const text = this.scene.add.text(offsetX, offsetY, formattedText, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 2,
        fill: true
      }
    });
    
    if (this.direction === 'left') {
      text.setOrigin(0, 0.5);
    } else if (this.direction === 'right') {
      text.setOrigin(1, 0.5);
    } else {
      text.setOrigin(0.5, 0.5);
    }
    
    return text;
  }

  private createAnimations(): void {
    const isHorizontal = this.direction === 'left' || this.direction === 'right';
    const floatDistance = 6;
    
    this.scene.tweens.add({
      targets: this,
      y: isHorizontal ? this.y - floatDistance : this.y,
      x: !isHorizontal ? this.x : this.x,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    if (!isHorizontal) {
      const moveDir = this.direction === 'up' ? -floatDistance : floatDistance;
      this.scene.tweens.add({
        targets: this,
        y: this.y + moveDir,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.scene.tweens.add({
      targets: this.arrow,
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  destroy(fromScene?: boolean): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.arrow);
    super.destroy(fromScene);
  }
}
