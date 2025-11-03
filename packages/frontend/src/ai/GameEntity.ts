import { Telegram } from './Telegram';
import { StateMachine } from './fsm/StateMachine';

export class GameEntity {
  public id: number;
  public active: boolean = true;
  public children: GameEntity[] = [];
  public parent: GameEntity | null = null;
  public name: string = '';
  public stateMachine: StateMachine<GameEntity>;

  constructor() {
    this.id = GameEntity.nextId++;
    this.stateMachine = new StateMachine(this);
  }

  public add(entity: GameEntity): void {
    entity.parent = this;
    this.children.push(entity);
  }

  public remove(entity: GameEntity): void {
    const index = this.children.indexOf(entity);
    if (index !== -1) {
      entity.parent = null;
      this.children.splice(index, 1);
    }
  }

  public update(delta: number): void {
    if (!this.active) return;

    this.stateMachine.update();

    this.children.forEach(child => child.update(delta));
  }

  public handleMessage(telegram: Telegram): boolean {
    return false;
  }

  private static nextId = 0;
}
