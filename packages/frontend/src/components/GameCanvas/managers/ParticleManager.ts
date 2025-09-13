import { useState, useCallback, useEffect, useRef } from 'react';
import { Particle, updateParticles, addParticles } from '../../renderers/effects/ParticleSystem';
import { AnimationSettings } from 'shared';

interface ParticleManagerProps {
  animationSettings: AnimationSettings;
  onAddParticles?: (x: number, y: number, color: string, count?: number) => void;
}

export const useParticleManager = ({ animationSettings, onAddParticles }: ParticleManagerProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeRef = useRef(0);

  const addParticlesToState = useCallback((x: number, y: number, color: string, count: number = 5) => {
    setParticles(prev => [...prev, ...addParticles(x, y, color, count)]);
    if (onAddParticles) {
      onAddParticles(x, y, color, count);
    }
  }, [onAddParticles]);

  useEffect(() => {
    const animate = () => {
      const speedMultiplier = animationSettings?.animationSpeed || 1.0;
      timeRef.current = timeRef.current + speedMultiplier;

      if (animationSettings?.showParticles !== false) {
        setParticles(prev => updateParticles(prev));
      }
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [animationSettings?.animationSpeed, animationSettings?.showParticles]);

  return {
    particles,
    addParticles: addParticlesToState,
  };
};
