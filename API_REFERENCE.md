# API Reference

This document provides a detailed reference for the services and configuration options in the biome rendering system.

## Services

- **`UnifiedRoughFillService`**: Renders biomes as unified, cohesive regions.
  - `applyUnifiedBiomeFill(biome: Biome, tileSize: number, animationFrame: number): void`
- **`BiomeTextureService`**: Adds texture overlays to biomes.
  - `addTextureOverlay(biome: Biome, textureConfig: TextureOverlayConfig, roughCanvas: RoughCanvas, animationFrame: number): void`
- **`BoundaryTracer`**: Creates smooth biome boundaries.
  - `march(cells: Position[], cellSize: number): number[][]`
- **`CorruptionOverlayService`**: Applies corruption effects to biomes.
  - `applyCorruptionEffects(biome: Biome, corruptionLevel: number, rc: RoughCanvas, animationFrame: number): void`
- **`BiomeTransitionService`**: Renders smooth transitions between adjacent biomes.
  - `renderBiomeTransitions(biomes: Biome[], rc: RoughCanvas, tileSize: number): void`

## Configuration

### `BiomeRenderConfig`

- `name: string`: The name of the biome.
- `colors: { primary: string; secondary: string; border: string; }`: The color palette for the biome.
- `roughnessBase: number`: The base roughness for the biome's `rough.js` fill.
- `bowingBase: number`: The base bowing for the biome's `rough.js` fill.
- `fillPattern: 'solid' | 'hachure' | 'cross-hatch' | 'zigzag-line' | 'dots'`: The `rough.js` fill pattern for the biome.
- `hachureAngle: number`: The angle of the hachure lines.
- `hachureGap: number`: The gap between hachure lines.
- `strokeWidth: number`: The width of the biome's border.
- `textureOverlay?: { type: 'trees' | 'rocks' | 'crystals' | 'ruins' | 'corruption'; density: number; size: number; }`: The texture overlay for the biome.
- `animationProperties?: { breathingIntensity: number; colorPulse: number; roughnessVariation: number; }`: The animation properties for the biome.

### `ENHANCED_RENDER_CONFIG`

- `animation`:
  - `enabled: boolean`: Whether animations are enabled.
  - `frameRate: number`: The target frame rate for animations.
  - `breathingIntensity: number`: The intensity of the breathing animation.
  - `colorPulseSpeed: number`: The speed of the color pulse animation.
- `performance`:
  - `maxBiomesPerFrame: number`: The maximum number of biomes to render per frame.
  - `textureDetailDistance: number`: The distance at which texture details are no longer rendered.
  - `animationDistance: number`: The distance at which animations are no longer rendered.
- `quality`:
  - `roughnessQuality: 'low' | 'medium' | 'high'`: The quality of the `rough.js` rendering.
  - `textureDetail: 'low' | 'medium' | 'high'`: The level of detail for textures.
  - `antiAliasing: boolean`: Whether anti-aliasing is enabled.