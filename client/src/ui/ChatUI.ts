import { ChatMessage, MAX_CHAT_HISTORY, MAX_MESSAGE_LENGTH } from '@clubcapy/shared';
import { NetworkManager } from '../network/NetworkManager';

export class ChatUI {
  private static instance: ChatUI | null = null;
  private container: HTMLDivElement;
  private messagesDiv: HTMLDivElement;
  private input: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private roomIndicator: HTMLDivElement;
  private playerCount: HTMLDivElement;
  private messages: ChatMessage[] = [];
  private networkManager: NetworkManager;
  private inputFocused: boolean = false;

  private constructor(parentId: string) {
    this.networkManager = NetworkManager.getInstance();
    
    const parent = document.getElementById(parentId);
    if (!parent) {
      throw new Error(`Parent element ${parentId} not found`);
    }

    const existingIndicator = document.getElementById('room-indicator');
    if (existingIndicator) existingIndicator.remove();
    const existingCount = document.getElementById('player-count');
    if (existingCount) existingCount.remove();
    const existingContainer = document.getElementById('chat-container');
    if (existingContainer) existingContainer.remove();

    this.roomIndicator = document.createElement('div');
    this.roomIndicator.id = 'room-indicator';
    this.roomIndicator.textContent = 'Town';
    parent.appendChild(this.roomIndicator);

    this.playerCount = document.createElement('div');
    this.playerCount.id = 'player-count';
    this.playerCount.textContent = 'Players: 1';
    parent.appendChild(this.playerCount);

    this.container = document.createElement('div');
    this.container.id = 'chat-container';
    parent.appendChild(this.container);

    this.messagesDiv = document.createElement('div');
    this.messagesDiv.id = 'chat-messages';
    this.container.appendChild(this.messagesDiv);

    const inputContainer = document.createElement('div');
    inputContainer.id = 'chat-input-container';
    this.container.appendChild(inputContainer);

    this.input = document.createElement('input');
    this.input.id = 'chat-input';
    this.input.type = 'text';
    this.input.placeholder = 'Type a message...';
    this.input.maxLength = MAX_MESSAGE_LENGTH;
    inputContainer.appendChild(this.input);

    this.sendButton = document.createElement('button');
    this.sendButton.id = 'chat-send';
    this.sendButton.textContent = 'Send';
    inputContainer.appendChild(this.sendButton);

    this.setupEventListeners();
    this.addSystemMessage('Welcome to ClubCapy! Use arrow keys to move.');
  }

  static getInstance(parentId: string = 'game-container'): ChatUI {
    if (!ChatUI.instance) {
      ChatUI.instance = new ChatUI(parentId);
    }
    return ChatUI.instance;
  }

  private setupEventListeners(): void {
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    this.input.addEventListener('focus', () => {
      this.inputFocused = true;
    });

    this.input.addEventListener('blur', () => {
      this.inputFocused = false;
    });

    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.inputFocused) {
        this.input.focus();
        e.preventDefault();
      }
    });
  }

  private sendMessage(): void {
    const message = this.input.value.trim();
    if (message) {
      this.networkManager.sendChat(message);
      this.input.value = '';
    }
    this.input.blur();
  }

  addMessage(chatMessage: ChatMessage): void {
    this.messages.push(chatMessage);
    if (this.messages.length > MAX_CHAT_HISTORY) {
      this.messages.shift();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `<span class="name">${this.escapeHtml(chatMessage.playerName)}:</span> <span class="text">${this.escapeHtml(chatMessage.message)}</span>`;
    this.messagesDiv.appendChild(messageDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }

  addSystemMessage(text: string): void {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message system';
    messageDiv.textContent = text;
    this.messagesDiv.appendChild(messageDiv);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }

  loadMessages(messages: ChatMessage[]): void {
    this.messagesDiv.innerHTML = '';
    this.messages = [];
    messages.forEach(msg => this.addMessage(msg));
  }

  setRoom(roomName: string): void {
    this.roomIndicator.textContent = roomName.charAt(0).toUpperCase() + roomName.slice(1);
  }

  setPlayerCount(count: number): void {
    this.playerCount.textContent = `Players: ${count}`;
  }

  isInputFocused(): boolean {
    return this.inputFocused;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
