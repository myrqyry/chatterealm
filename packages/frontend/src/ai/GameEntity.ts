export class GameEntity {
  public id: number;
  public active: boolean = true;
  public children: GameEntity[] = [];
  public parent: GameEntity | null = null;
  public name: string = '';

  constructor() {
    this.id = GameEntity.nextId++;
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
    this.children.forEach(child => child.update(delta));
  }

  private static nextId = 0;
}
