import { Telegram } from './Telegram';
import { StateMachine } from './fsm/StateMachine';
import { Vector2D } from './steering/Vector2D';
import { SteeringBehavior } from './steering/SteeringBehavior';
import { Vision } from './perception/Vision';
import { MemorySystem } from './perception/MemorySystem';
import { EntityManager } from './EntityManager';

export class GameEntity {
  public id: number;
  public active: boolean = true;
  public children: GameEntity[] = [];
  public parent: GameEntity | null = null;
  public name: string = '';
  public stateMachine: StateMachine<GameEntity>;
  public position: Vector2D;
  public velocity: Vector2D;
  public maxSpeed: number;
  public mass: number;
  public steering: SteeringBehavior | null = null;
  public vision: Vision;
  public memory: MemorySystem;

  constructor(entityManager: EntityManager, x: number = 0, y: number = 0) {
    this.id = GameEntity.nextId++;
    this.stateMachine = new StateMachine(this);
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D();
    this.maxSpeed = 1;
    this.mass = 1;
    this.vision = new Vision(this, entityManager);
    this.memory = new MemorySystem(this);
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
    this.memory.updateSystem();

    if (this.steering) {
      const steeringForce = this.steering.calculate(this);
      const acceleration = steeringForce.clone().divideScalar(this.mass);

      this.velocity.add(acceleration.multiplyScalar(delta));
      this.velocity.truncate(this.maxSpeed);

      this.position.add(this.velocity.clone().multiplyScalar(delta));
    }

    this.children.forEach(child => child.update(delta));
  }

  public handleMessage(telegram: Telegram): boolean {
    return false;
  }

  private static nextId = 0;
}
