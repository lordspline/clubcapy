import { MAX_CHAT_HISTORY } from 'shared';

export class ChatUI {
  private container: HTMLDivElement;
  private messagesContainer: HTMLDivElement;
  private inputContainer: HTMLDivElement;
  private input: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private onSendCallback?: (message: string) => void;

  constructor(parentElement: HTMLElement) {
    this.container = document.createElement('div');
    this.container.id = 'chat-ui';
    this.container.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 150px;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      z-index: 1000;
    `;

    this.messagesContainer = document.createElement('div');
    this.messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    `;

    this.inputContainer = document.createElement('div');
    this.inputContainer.style.cssText = `
      display: flex;
      padding: 8px;
      gap: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    `;

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Type a message...';
    this.input.maxLength = 200;
    this.input.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      outline: none;
    `;

    this.sendButton = document.createElement('button');
    this.sendButton.textContent = 'Send';
    this.sendButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #8B7355;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    `;

    this.sendButton.addEventListener('mouseenter', () => {
      this.sendButton.style.background = '#A0826D';
    });
    this.sendButton.addEventListener('mouseleave', () => {
      this.sendButton.style.background = '#8B7355';
    });

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    this.inputContainer.appendChild(this.input);
    this.inputContainer.appendChild(this.sendButton);

    this.container.appendChild(this.messagesContainer);
    this.container.appendChild(this.inputContainer);

    parentElement.appendChild(this.container);
  }

  private sendMessage(): void {
    const message = this.input.value.trim();
    if (message && this.onSendCallback) {
      this.onSendCallback(message);
      this.input.value = '';
    }
  }

  onSendMessage(callback: (message: string) => void): void {
    this.onSendCallback = callback;
  }

  addMessage(playerName: string, message: string, scroll: boolean = true): void {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      color: white;
      font-size: 13px;
      line-height: 1.4;
      word-wrap: break-word;
    `;
    
    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = `
      color: #FFD700;
      font-weight: bold;
    `;
    nameSpan.textContent = `[${playerName}]: `;
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    
    messageEl.appendChild(nameSpan);
    messageEl.appendChild(textSpan);
    
    this.messagesContainer.appendChild(messageEl);

    while (this.messagesContainer.children.length > MAX_CHAT_HISTORY) {
      this.messagesContainer.removeChild(this.messagesContainer.firstChild!);
    }

    if (scroll) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  clearMessages(): void {
    this.messagesContainer.innerHTML = '';
  }

  setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'flex' : 'none';
  }

  focus(): void {
    this.input.focus();
  }

  blur(): void {
    this.input.blur();
  }

  isInputFocused(): boolean {
    return document.activeElement === this.input;
  }
}
