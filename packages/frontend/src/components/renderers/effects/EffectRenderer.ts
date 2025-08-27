import { drawParticles, Particle } from './ParticleSystem';

export const drawEffects = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  drawParticles(ctx, particles);
  // Additional effects logic can be added here
};