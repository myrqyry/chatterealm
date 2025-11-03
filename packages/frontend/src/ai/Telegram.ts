// packages/frontend/src/ai/Telegram.ts

import { ITelegram } from './AITypes';

export class Telegram implements ITelegram {
  public sender: number;
  public receiver: number;
  public message: string;
  public dispatchTime: number;
  public extraInfo?: any;

  constructor(
    sender: number,
    receiver: number,
    message: string,
    dispatchTime: number,
    extraInfo?: any
  ) {
    this.sender = sender;
    this.receiver = receiver;
    this.message = message;
    this.dispatchTime = dispatchTime;
    this.extraInfo = extraInfo;
  }
}
