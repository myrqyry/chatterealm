import { Telegram } from './Telegram';
import { EntityManager } from './EntityManager';
import { GameEntity } from './GameEntity';

/**
 * @class MessageDispatcher
 * @description A class for managing the dispatching of messages between game entities.
 */
export class MessageDispatcher {
  private entityManager: EntityManager;
  private priorityQueue: Telegram[] = [];

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  /**
   * Dispatches a message to a receiver.
   * @param sender The sender of the message.
   * @param receiver The receiver of the message.
   * @param messageType The type of the message.
   * @param delay The delay in milliseconds before the message is sent.
   * @param data Any additional data to send with the message.
   */
  public dispatch(
    sender: number,
    receiver: number,
    messageType: string,
    delay: number = 0,
    data: any = null
  ): void {
    const receiverEntity = this.entityManager.get(receiver);

    if (receiverEntity) {
      const telegram = new Telegram(sender, receiver, messageType, delay, data);

      if (delay <= 0) {
        this.discharge(receiverEntity, telegram);
      } else {
        const dispatchTime = Date.now() + delay;
        telegram.dispatchTime = dispatchTime;
        this.priorityQueue.push(telegram);
        this.priorityQueue.sort((a, b) => a.dispatchTime - b.dispatchTime);
      }
    }
  }

  /**
   * Dispatches delayed messages.
   */
  public dispatchDelayedMessages(): void {
    const currentTime = Date.now();

    while (
      this.priorityQueue.length > 0 &&
      this.priorityQueue[0].dispatchTime <= currentTime
    ) {
      const telegram = this.priorityQueue.shift()!;
      const receiver = this.entityManager.get(telegram.receiver);

      if (receiver) {
        this.discharge(receiver, telegram);
      }
    }
  }

  private discharge(receiver: GameEntity, telegram: Telegram): void {
    receiver.handleMessage(telegram);
  }
}
