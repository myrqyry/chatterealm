// packages/frontend/src/ai/MessageDispatcher.ts

import { Telegram } from './Telegram';
import { EntityManager } from './EntityManager';
import { GameEntity } from './GameEntity';

export class MessageDispatcher {
  private static instance: MessageDispatcher;
  private priorityQueue: Telegram[] = [];
  private entityManager: EntityManager | null = null;

  private constructor() {}

  static getInstance(): MessageDispatcher {
    if (!MessageDispatcher.instance) {
      MessageDispatcher.instance = new MessageDispatcher();
    }
    return MessageDispatcher.instance;
  }

  public setEntityManager(entityManager: EntityManager): void {
    this.entityManager = entityManager;
  }

  public dispatchMessage(
    delay: number,
    senderId: number,
    receiverId: number,
    message: string,
    extraInfo?: any
  ): void {
    if (!this.entityManager) return;
    const receiver = this.entityManager.getEntityById(receiverId);
    if (!receiver) {
      console.warn('Message receiver not found');
      return;
    }

    const telegram = new Telegram(senderId, receiverId, message, 0, extraInfo);

    if (delay <= 0) {
      this.discharge(receiver, telegram);
    } else {
      const currentTime = Date.now();
      telegram.dispatchTime = currentTime + delay;
      this.priorityQueue.push(telegram);
      this.priorityQueue.sort((a, b) => a.dispatchTime - b.dispatchTime);
    }
  }

  public dispatchDelayedMessages(): void {
    const currentTime = Date.now();
    while (
      this.priorityQueue.length > 0 &&
      this.priorityQueue[0].dispatchTime < currentTime &&
      this.priorityQueue[0].dispatchTime > 0
    ) {
      const telegram = this.priorityQueue.shift()!;
      const receiver = this.entityManager.getEntityById(telegram.receiver);
      if (receiver) {
        this.discharge(receiver, telegram);
      }
    }
  }

  private discharge(receiver: GameEntity, telegram: Telegram): void {
    if (!receiver.handleMessage(telegram)) {
      console.warn('Message not handled by receiver');
    }
  }
}
