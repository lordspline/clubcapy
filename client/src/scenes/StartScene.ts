import Phaser from 'phaser';
import { NetworkManager } from '../network/NetworkManager';
import { GAME_WIDTH } from '@clubcapy/shared';

const NAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

export class StartScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private overlay!: HTMLDivElement;
  private nameInput!: HTMLInputElement;
  private joinButton!: HTMLButtonElement;
  private errorDiv!: HTMLDivElement;
  private capybaraSprite?: Phaser.GameObjects.Sprite;

  constructor() {
    super({ key: 'StartScene' });
  }

  create(): void {
    this.networkManager = NetworkManager.getInstance();
    
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const titleText = this.add.text(GAME_WIDTH / 2, 80, 'ClubCapy', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);

    this.capybaraSprite = this.add.sprite(GAME_WIDTH / 2, 220, 'capybara', 0);
    this.capybaraSprite.setScale(4);

    this.createHTMLOverlay();
    this.setupNetworkHandlers();
  }

  private createHTMLOverlay(): void {
    const parent = document.getElementById('game-container');
    if (!parent) return;

    const existingOverlay = document.getElementById('start-overlay');
    if (existingOverlay) existingOverlay.remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'start-overlay';
    this.overlay.style.cssText = `
      position: absolute;
      bottom: 150px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      padding: 24px 32px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      z-index: 100;
    `;

    const label = document.createElement('div');
    label.textContent = 'Choose your name';
    label.style.cssText = `
      color: #ffffff;
      font-size: 18px;
      font-weight: bold;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    this.overlay.appendChild(label);

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Enter your name...';
    this.nameInput.maxLength = 16;
    this.nameInput.style.cssText = `
      width: 220px;
      padding: 10px 14px;
      border: none;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      outline: none;
    `;
    this.overlay.appendChild(this.nameInput);

    this.errorDiv = document.createElement('div');
    this.errorDiv.style.cssText = `
      color: #ff6b6b;
      font-size: 14px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 20px;
      text-align: center;
    `;
    this.overlay.appendChild(this.errorDiv);

    this.joinButton = document.createElement('button');
    this.joinButton.textContent = 'Join';
    this.joinButton.disabled = true;
    this.joinButton.style.cssText = `
      padding: 10px 32px;
      border: none;
      border-radius: 4px;
      background: #4CAF50;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
      opacity: 0.5;
    `;
    this.overlay.appendChild(this.joinButton);

    parent.appendChild(this.overlay);

    this.setupInputListeners();
  }

  private setupInputListeners(): void {
    this.nameInput.addEventListener('input', () => {
      const name = this.nameInput.value.trim();
      const isValid = NAME_REGEX.test(name);
      
      this.joinButton.disabled = !isValid;
      this.joinButton.style.opacity = isValid ? '1' : '0.5';
      this.joinButton.style.cursor = isValid ? 'pointer' : 'not-allowed';

      if (name.length > 0 && !isValid) {
        if (name.length < 3) {
          this.showError('Name must be at least 3 characters');
        } else if (name.length > 16) {
          this.showError('Name must be 16 characters or less');
        } else {
          this.showError('Only letters, numbers, and underscores allowed');
        }
      } else {
        this.hideError();
      }
    });

    this.nameInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter' && !this.joinButton.disabled) {
        this.handleJoin();
      }
    });

    this.joinButton.addEventListener('click', () => {
      if (!this.joinButton.disabled) {
        this.handleJoin();
      }
    });

    this.nameInput.addEventListener('focus', () => {
      this.nameInput.style.background = '#fff';
    });

    this.nameInput.addEventListener('blur', () => {
      this.nameInput.style.background = 'rgba(255, 255, 255, 0.9)';
    });
  }

  private handleJoin(): void {
    const name = this.nameInput.value.trim();
    
    if (!NAME_REGEX.test(name)) {
      this.showError('Invalid name format');
      return;
    }

    this.setLoading(true);
    this.hideError();

    if (!this.networkManager.isConnected()) {
      this.networkManager.connect();
      this.networkManager.socket.once('connect', () => {
        this.networkManager.join(name);
      });
      this.networkManager.socket.once('connect_error', () => {
        this.showError('Failed to connect to server');
        this.setLoading(false);
      });
    } else {
      this.networkManager.join(name);
    }
  }

  private setupNetworkHandlers(): void {
    this.networkManager.onError((message: string) => {
      this.showError(message);
      this.setLoading(false);
    });

    this.networkManager.onRoomState(() => {
      this.destroyOverlay();
      this.scene.start('TownScene', {
        playerId: this.networkManager.getSocketId(),
        playerName: this.nameInput.value.trim()
      });
    });
  }

  private showError(message: string): void {
    this.errorDiv.textContent = message;
  }

  private hideError(): void {
    this.errorDiv.textContent = '';
  }

  private setLoading(loading: boolean): void {
    this.joinButton.disabled = loading;
    this.joinButton.textContent = loading ? 'Joining...' : 'Join';
    this.joinButton.style.opacity = loading ? '0.5' : '1';
    this.nameInput.disabled = loading;
  }

  private destroyOverlay(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }

  shutdown(): void {
    this.destroyOverlay();
  }
}
