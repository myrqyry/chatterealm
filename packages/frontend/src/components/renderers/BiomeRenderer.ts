import { Biome, TerrainType } from 'shared';
import { RoughCanvas } from 'roughjs/bin/canvas';

const biomeStyles: Record<TerrainType, any> = {
    [TerrainType.WATER]: { fill: '#a0d2eb', fillStyle: 'solid' },
    [TerrainType.OCEAN]: { fill: '#4a90e2', fillStyle: 'solid' },
    [TerrainType.RIVER]: { fill: '#81c7f5', fillStyle: 'solid' },
    [TerrainType.MOUNTAIN_PEAK]: { fill: '#d8d8d8', fillStyle: 'cross-hatch' },
    [TerrainType.MOUNTAIN]: { fill: '#a9a9a9', fillStyle: 'cross-hatch' },
    [TerrainType.HILLS]: { fill: '#c3d69b', fillStyle: 'hachure' },
    [TerrainType.SNOW]: { fill: '#ffffff', fillStyle: 'zigzag' },
    [TerrainType.ICE]: { fill: '#e0ffff', fillStyle: 'dashed' },
    [TerrainType.SNOWY_HILLS]: { fill: '#e6e6fa', fillStyle: 'hachure' },
    [TerrainType.DUNES]: { fill: '#f0e68c', fillStyle: 'dots' },
    [TerrainType.OASIS]: { fill: '#32cd32', fillStyle: 'solid' },
    [TerrainType.SAND]: { fill: '#f4a460', fillStyle: 'dots' },
    [TerrainType.DENSE_JUNGLE]: { fill: '#006400', fillStyle: 'zigzag-line' },
    [TerrainType.JUNGLE]: { fill: '#228b22', fillStyle: 'zigzag-line' },
    [TerrainType.DEEP_WATER]: { fill: '#00008b', fillStyle: 'solid' },
    [TerrainType.MARSH]: { fill: '#556b2f', fillStyle: 'hachure' },
    [TerrainType.SWAMP]: { fill: '#2f4f4f', fillStyle: 'hachure' },
    [TerrainType.DENSE_FOREST]: { fill: '#008000', fillStyle: 'cross-hatch' },
    [TerrainType.FOREST]: { fill: '#2e8b57', fillStyle: 'cross-hatch' },
    [TerrainType.CLEARING]: { fill: '#90ee90', fillStyle: 'hachure' },
    [TerrainType.ROLLING_HILLS]: { fill: '#b0c4de', fillStyle: 'hachure' },
    [TerrainType.FLOWER_FIELD]: { fill: '#ffb6c1', fillStyle: 'dots' },
    [TerrainType.GRASSLAND]: { fill: '#98fb98', fillStyle: 'hachure' },
    [TerrainType.ROUGH_TERRAIN]: { fill: '#d2b48c', fillStyle: 'dots' },
    [TerrainType.ANCIENT_RUINS]: { fill: '#778899', fillStyle: 'cross-hatch' },
    [TerrainType.PLAIN]: { fill: '#adff2f', fillStyle: 'hachure' },
};

export class BiomeRenderer {
    public drawBiome(rc: RoughCanvas, biome: Biome, tileSize: number): void {
        const style = biomeStyles[biome.type] || { fill: '#ccc', fillStyle: 'solid' };
        const { minX, minY, maxX, maxY } = biome.bounds;

        const x = minX * tileSize;
        const y = minY * tileSize;
        const width = (maxX - minX + 1) * tileSize;
        const height = (maxY - minY + 1) * tileSize;

        rc.rectangle(x, y, width, height, style);
    }
}