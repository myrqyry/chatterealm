export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const addParticles = (x: number, y: number, color: string, count: number = 5): Particle[] => {
  const newParticles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    newParticles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      maxLife: 30,
      color,
      size: Math.random() * 3 + 1
    });
  }
  return newParticles;
};

export const updateParticles = (prevParticles: Particle[]): Particle[] => {
  return prevParticles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1,
      vy: p.vy + 0.1 // gravity
    }))
    .filter(p => p.life > 0);
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
  particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};