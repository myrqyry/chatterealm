import { ChatMessage } from '../../types/chat';

class MessageHandler {
  private messages: ChatMessage[] = [];
  private updateMessagesCallback: ((messages: ChatMessage[]) => void) | null = null;

  public setUpdateMessagesCallback(callback: (messages: ChatMessage[]) => void): void {
    this.updateMessagesCallback = callback;
  }

  public handleNewMessage(message: ChatMessage): void {
    this.messages = [...this.messages, message];
    this.notifyUpdate();
  }

  public addSentMessage(message: string, username: string, displayName: string): void {
    const sentMsg: ChatMessage = {
      message,
      timestamp: Date.now(),
      isResponse: false,
      username,
      displayName,
    };
    this.messages = [...this.messages, sentMsg];
    this.notifyUpdate();
  }

  public addErrorMessage(message: string): void {
    const errorMsg: ChatMessage = {
      message,
      timestamp: Date.now(),
      isResponse: true, // Treat it like a system response
      username: 'System',
      displayName: 'System',
      isError: true,
    };
    this.messages = [...this.messages, errorMsg];
    this.notifyUpdate();
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  private notifyUpdate(): void {
    if (this.updateMessagesCallback) {
      this.updateMessagesCallback([...this.messages]);
    }
  }
}

export const messageHandler = new MessageHandler();