/**
 * @class Telegram
 * @description A class for representing a message between two game entities.
 */
export class Telegram {
  /**
   * The ID of the entity that sent this telegram.
   */
  public sender: number;

  /**
   * The ID of the entity that should receive this telegram.
   */
  public receiver: number;

  /**
   * The message type.
   */
  public messageType: string;

  /**
   * The time when the message should be dispatched. A value of -1 indicates an immediate dispatch.
   */
  public dispatchTime: number;

  /**
   * Any additional information that may be accompanying the message.
   */
  public data: any;

  constructor(
    sender: number,
    receiver: number,
    messageType: string,
    dispatchTime: number = -1,
    data: any = null
  ) {
    this.sender = sender;
    this.receiver = receiver;
    this.messageType = messageType;
    this.dispatchTime = dispatchTime;
    this.data = data;
  }
}
