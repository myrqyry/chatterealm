import { useRef, useEffect, useState } from 'react';
import { GAME_CONFIG } from 'shared';

interface CanvasSetup {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  tileSizePx: number;
  offset: { x: number; y: number };
  dpr: number;
  isReady: boolean;
}

export const useCanvasSetup = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  containerSize: { width: number; height: number },
  grid: { length: number } | null,
  innerPadding: number = 8
): CanvasSetup => {
  const [isReady, setIsReady] = useState(false);
  const setupRef = useRef<CanvasSetup>({
    canvas: null,
    ctx: null,
    tileSizePx: 0,
    offset: { x: 0, y: 0 },
    dpr: 1,
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

    // Set canvas dimensions
    canvas.style.width = `${containerSize.width}px`;
    canvas.style.height = `${containerSize.height}px`;
    canvas.width = Math.floor(containerSize.width * dpr);
    canvas.height = Math.floor(containerSize.height * dpr);

    // Apply DPR scaling
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

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
      isReady: true,
    };

    setIsReady(true);

    // Cleanup on unmount
    return () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    };
  }, [canvasRef, containerSize, grid, innerPadding]);

  return setupRef.current;
};
