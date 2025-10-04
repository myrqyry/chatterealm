import { useRef, useEffect, useState } from 'react';
import { GAME_CONFIG } from 'shared';

interface CanvasSetup {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  tileSizePx: number;
  offset: { x: number; y: number };
  dpr: number;
  renderScale: number;
  isReady: boolean;
}

export const useCanvasSetup = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  containerSize: { width: number; height: number },
  grid: { length: number } | null,
  innerPadding: number = 8,
  renderScale: number = 0.75 // Default to 75% resolution for better performance
): CanvasSetup => {
  const [isReady, setIsReady] = useState(false);
  const setupRef = useRef<CanvasSetup>({
    canvas: null,
    ctx: null,
    tileSizePx: 0,
    offset: { x: 0, y: 0 },
    dpr: 1,
    renderScale: renderScale,
    isReady: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerSize.width || !containerSize.height || !grid) {
      setIsReady(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('useCanvasSetup: cannot get 2d context');
      return;
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const numTilesX = grid[0]?.length || 60;
    const numTilesY = grid.length || 30;
    const gridSize = GAME_CONFIG.tileSize;

    // Calculate scaling
    const effectiveCssWidth = Math.max(0, containerSize.width - innerPadding * 2);
    const effectiveCssHeight = Math.max(0, containerSize.height - innerPadding * 2);
    const scaleX = effectiveCssWidth / (numTilesX * gridSize);
    const scaleY = effectiveCssHeight / (numTilesY * gridSize);
    const worldScale = Math.min(scaleX, scaleY);
    const clampedWorldScale = Math.max(1.0, Math.min(worldScale, 5.0));

    const tileSizePx = gridSize * clampedWorldScale;
    const renderedWidth = numTilesX * tileSizePx;
    const renderedHeight = numTilesY * tileSizePx;

    // Apply render scaling for performance optimization
    const scaledWidth = Math.floor(containerSize.width * renderScale);
    const scaledHeight = Math.floor(containerSize.height * renderScale);

    // Ensure dimensions don't exceed reasonable bounds (prevent runaway growth)
    const maxReasonableWidth = 4096; // 4K width max
    const maxReasonableHeight = 2160; // 4K height max
    const boundedScaledWidth = Math.min(scaledWidth, maxReasonableWidth);
    const boundedScaledHeight = Math.min(scaledHeight, maxReasonableHeight);

    // Debug logging
    console.log('CanvasSetup:', {
      container: { width: Math.round(containerSize.width), height: Math.round(containerSize.height) },
      scaled: { width: boundedScaledWidth, height: boundedScaledHeight },
      final: { width: Math.floor(boundedScaledWidth * dpr), height: Math.floor(boundedScaledHeight * dpr) },
      dpr, renderScale
    });

    // Set canvas dimensions with scaling
    canvas.style.width = `${containerSize.width}px`;
    canvas.style.height = `${containerSize.height}px`;
    canvas.width = Math.floor(boundedScaledWidth * dpr);
    canvas.height = Math.floor(boundedScaledHeight * dpr);

    // Reset transform to identity first, then apply our transforms
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Apply DPR and render scaling
    ctx.setTransform(dpr * renderScale, 0, 0, dpr * renderScale, 0, 0);
    ctx.imageSmoothingEnabled = true; // Enable smoothing for scaled rendering
    ctx.imageSmoothingQuality = 'high';

    // Center the game world
    const offsetX = innerPadding + (effectiveCssWidth - renderedWidth) / 2;
    const offsetY = innerPadding + (effectiveCssHeight - renderedHeight) / 2;
    ctx.translate(offsetX, offsetY);

    // Update ref
    setupRef.current = {
      canvas,
      ctx,
      tileSizePx,
      offset: { x: offsetX, y: offsetY },
      dpr,
      renderScale,
      isReady: true,
    };

    setIsReady(true);

    // Cleanup on unmount
    return () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    };
  }, [canvasRef, containerSize, grid, innerPadding, renderScale]);

  return setupRef.current;
};
