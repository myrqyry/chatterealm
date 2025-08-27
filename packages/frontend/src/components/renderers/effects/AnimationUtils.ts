export const getFloatOffset = (time: number, x: number, y: number, amplitude: number = 2, frequency: number = 0.05): number => {
  return Math.sin(time * frequency + x + y) * amplitude;
};

export const getPulseScale = (time: number, baseScale: number = 1, amplitude: number = 0.05, frequency: number = 0.1): number => {
  return baseScale + Math.sin(time * frequency) * amplitude;
};

export const getWindOffset = (time: number, x: number, y: number, amplitude: number = 2.5, frequency: number = 0.02): number => {
  return Math.sin(time * frequency + x + y) * amplitude;
};

export const getWaveOffset = (time: number, x: number, w: number, amplitude: number = 2, frequency: number = 0.08): number => {
  return Math.sin(time * frequency + x * 0.5 + w) * amplitude;
};

export const getCurrentOffset = (time: number, y: number, amplitude: number = 3, frequency: number = 0.12): number => {
  return Math.sin(time * frequency + y) * amplitude;
};

export const getSwayOffset = (time: number, x: number, t: number, amplitude: number = 2, frequency: number = 0.03): number => {
  return Math.sin(time * frequency + x + t) * amplitude;
};