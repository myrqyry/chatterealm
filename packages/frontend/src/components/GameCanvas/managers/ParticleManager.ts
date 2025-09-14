import { useState, useCallback } from 'react';
import { Particle, updateParticles, addParticles } from '../../renderers/effects/ParticleSystem';
import { AnimationSettings } from 'shared';

interface ParticleManagerProps {
  animationSettings: AnimationSettings;
  onAddParticles?: (x: number, y: number, color: string, count?: number) => void;
}

export const useParticleManager = ({ animationSettings, onAddParticles }: ParticleManagerProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const addParticlesToState = useCallback((x: number, y: number, color: string, count: number = 5) => {
    setParticles(prev => [...prev, ...addParticles(x, y, color, count)]);
    if (onAddParticles) {
      onAddParticles(x, y, color, count);
    }
  }, [onAddParticles]);

  // Update particles - this will be called from the main render loop
  const updateParticlesInState = useCallback(() => {
    if (animationSettings?.showParticles !== false) {
      setParticles(prev => updateParticles(prev));
    }
  }, [animationSettings?.showParticles]);

  return {
    particles,
    addParticles: addParticlesToState,
    updateParticles: updateParticlesInState,
  };
};
