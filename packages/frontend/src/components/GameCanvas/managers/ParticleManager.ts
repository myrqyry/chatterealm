import { useState, useCallback, useRef } from 'react';
import { Particle, updateParticles, addParticles } from '../../renderers/effects/ParticleSystem';
import { AnimationSettings } from 'shared';

interface ParticleManagerProps {
  animationSettings: AnimationSettings;
  onAddParticles?: (x: number, y: number, color: string, count?: number) => void;
}

export const useParticleManager = ({ animationSettings, onAddParticles }: ParticleManagerProps) => {
  const particlesRef = useRef<Particle[]>([]);

  const addParticlesToState = useCallback((x: number, y: number, color: string, count: number = 5) => {
    const newParticles = addParticles(x, y, color, count);
    particlesRef.current = [...particlesRef.current, ...newParticles];
    if (onAddParticles) {
      onAddParticles(x, y, color, count);
    }
  }, [onAddParticles]);

  // Update particles - this will be called from the main render loop
  const updateParticlesInState = useCallback(() => {
    if (animationSettings?.showParticles !== false) {
      particlesRef.current = updateParticles(particlesRef.current);
    }
  }, [animationSettings?.showParticles]);

  return {
    particles: particlesRef.current,
    addParticles: addParticlesToState,
    updateParticles: updateParticlesInState,
  };
};
