// Draw backdrop using CSS pixel dimensions so it's not affected by any DPR
// transform applied on the context by the caller.
export const setupCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  numTilesX: number,
  numTilesY: number,
  gridSize: number,
  cssWidth: number,
  cssHeight: number
) => {
  // Clear backing buffer first
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background using CSS coordinates. Temporarily reset transform to
  // identity so our CSS-based gradient and fill aren't scaled by DPR.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const bgGradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
  bgGradient.addColorStop(0, '#191724');
  bgGradient.addColorStop(1, '#1f1d2e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  ctx.restore();
};
