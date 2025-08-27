export const setupCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, numTilesX: number, numTilesY: number, gridSize: number) => {
  canvas.width = gridSize * numTilesX;
  canvas.height = gridSize * numTilesY;

  // Clear canvas with animated background
  const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGradient.addColorStop(0, '#191724');
  bgGradient.addColorStop(1, '#1f1d2e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};