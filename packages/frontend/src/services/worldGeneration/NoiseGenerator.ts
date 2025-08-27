// Simple noise function for natural terrain generation
export const noise = (x: number, y: number, seed: number = 0) => {
  const n = Math.sin(x * 0.01 + seed) * Math.cos(y * 0.01 + seed) * 0.5 + 0.5;
  return n;
};

// Perlin-like noise for smoother transitions
export const perlinNoise = (x: number, y: number, octaves: number = 4) => {
  let value = 0;
  let amplitude = 1;
  let frequency = 0.05;

  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency, i) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value;
};