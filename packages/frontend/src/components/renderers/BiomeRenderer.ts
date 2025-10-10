import { Biome, BIOME_RENDER_CONFIGS } from 'shared';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { UnifiedRoughFillService } from '../../services/UnifiedRoughFillService';
import { BiomeTextureService } from '../../services/BiomeTextureService';

export class BiomeRenderer {
    private unifiedRoughFillService: UnifiedRoughFillService;
    private textureService: BiomeTextureService;
    private currentAnimationFrame: number = 0;

    constructor(private rc: RoughCanvas) {
        this.unifiedRoughFillService = new UnifiedRoughFillService(this.rc);
        this.textureService = new BiomeTextureService();
    }

    public setAnimationFrame(frame: number): void {
        this.currentAnimationFrame = frame;
    }

    public drawBiome(biome: Biome, tileSize: number): void {
        this.unifiedRoughFillService.applyUnifiedBiomeFill(
            biome,
            tileSize,
            this.currentAnimationFrame
        );

        const config = BIOME_RENDER_CONFIGS[biome.type];
        if (config.textureOverlay) {
            this.textureService.addTextureOverlay(
                biome,
                config.textureOverlay,
                this.rc,
                this.currentAnimationFrame
            );
        }
    }
}