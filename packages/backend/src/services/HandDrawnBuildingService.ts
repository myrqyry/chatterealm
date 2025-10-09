import { BuildingType, HandDrawnBuilding } from 'shared/src/types/game';

export class HandDrawnBuildingService {
  public generateBuilding(type: BuildingType, size: { width: number; height: number }): HandDrawnBuilding {
    const building: HandDrawnBuilding = {
      type,
      size,
      roughSvg: this.generateBuildingSvg(type, size),
      lootCapacity: this.calculateLootCapacity(type, size),
      searchTime: this.calculateSearchTime(type, size),
      dangerLevel: this.calculateDangerLevel(type)
    };

    return building;
  }

  private generateBuildingSvg(type: BuildingType, size: { width: number; height: number }): string {
    const { width, height } = size;
    const baseRoughness = this.getBuildingRoughness(type);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * 32}" height="${height * 32}" viewBox="0 0 ${width * 32} ${height * 32}">`;

    svg += this.roughRectangle(2, 2, width * 32 - 4, height * 32 - 4, {
      roughness: baseRoughness,
      stroke: '#4a4a4a',
      strokeWidth: 2,
      fill: this.getBuildingColor(type)
    });

    switch (type) {
      case BuildingType.HOUSE:
        svg += this.addHouseDetails(width, height, baseRoughness);
        break;
      case BuildingType.WAREHOUSE:
        svg += this.addWarehouseDetails(width, height, baseRoughness);
        break;
      case BuildingType.BUNKER:
        svg += this.addBunkerDetails(width, height, baseRoughness);
        break;
    }

    svg += this.addBattleDamage(width, height, baseRoughness * 1.5);

    svg += '</svg>';
    return svg;
  }

  private addBattleDamage(width: number, height: number, roughness: number): string {
    let damage = '';
    const damageCount = Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < damageCount; i++) {
      const x = Math.random() * width * 32;
      const y = Math.random() * height * 32;
      const size = Math.random() * 8 + 3;

      damage += this.roughCircle(x, y, size, {
        roughness: roughness * 2,
        stroke: '#222',
        strokeWidth: 1,
        fill: '#111'
      });
    }

    return damage;
  }

  private calculateLootCapacity(type: BuildingType, size: { width: number; height: number }): number {
      return size.width * size.height * 2;
  }

  private calculateSearchTime(type: BuildingType, size: { width: number; height: number }): number {
      return size.width * size.height * 5;
  }

  private calculateDangerLevel(type: BuildingType): number {
      switch (type) {
          case BuildingType.BUNKER: return 8;
          case BuildingType.WAREHOUSE: return 5;
          case BuildingType.HOUSE: return 2;
          default: return 1;
      }
  }

  private getBuildingRoughness(type: BuildingType): number {
      switch (type) {
          case BuildingType.BUNKER: return 1;
          case BuildingType.WAREHOUSE: return 2;
          case BuildingType.HOUSE: return 3;
          default: return 2;
      }
  }

  private getBuildingColor(type: BuildingType): string {
      switch (type) {
          case BuildingType.HOUSE: return '#d2b48c';
          case BuildingType.WAREHOUSE: return '#a9a9a9';
          case BuildingType.BUNKER: return '#696969';
          default: return '#cccccc';
      }
  }

  private addHouseDetails(width: number, height: number, baseRoughness: number): string {
      let details = '';
      details += this.roughRectangle(width * 16 - 8, height * 32 - 16, 16, 16, { roughness: baseRoughness, stroke: '#654321', fill: '#8b4513' });
      details += this.roughRectangle(width * 8, height * 16 - 8, 16, 16, { roughness: baseRoughness, stroke: '#000', fill: '#add8e6' });
      return details;
  }

  private addWarehouseDetails(width: number, height: number, baseRoughness: number): string {
      let details = '';
      details += this.roughRectangle(width * 16 - 24, height * 32 - 32, 48, 32, { roughness: baseRoughness, stroke: '#333', fill: '#555' });
      return details;
  }

  private addBunkerDetails(width: number, height: number, baseRoughness: number): string {
      let details = '';
      details += this.roughRectangle(width * 16 - 10, height * 32 - 20, 20, 20, { roughness: baseRoughness, stroke: '#000', fill: '#444' });
      return details;
  }

  private roughRectangle(x: number, y: number, width: number, height: number, options: any): string {
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${options.stroke || 'black'}" stroke-width="${options.strokeWidth || 1}" fill="${options.fill || 'none'}" style="stroke-linejoin:round; stroke-linecap:round;"/>`;
  }

  private roughCircle(x: number, y: number, diameter: number, options: any): string {
    return `<circle cx="${x}" cy="${y}" r="${diameter / 2}" stroke="${options.stroke || 'black'}" stroke-width="${options.strokeWidth || 1}" fill="${options.fill || 'none'}"/>`;
  }
}