import React, { useEffect, useRef } from 'react';
import { CharacterClass } from 'shared';
import { getClassBackgroundGradient, getClassEffectClasses, getClassFilter } from '../../utils/classVisuals';

const createParticleSystem = (characterClass: CharacterClass): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'particles absolute inset-0';

  const particleCount = 15;
  const particleType = getParticleType(characterClass.id);

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = `particle particle-${particleType}`;
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${characterClass.primaryColor};
      border-radius: 50%;
      opacity: ${Math.random() * 0.6 + 0.2};
      animation: ${particleType}-float ${Math.random() * 3 + 2}s infinite linear;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 2}s;
    `;

    container.appendChild(particle);
  }

  return container;
};

const getParticleType = (classId: string): string => {
  switch (classId) {
    case 'quantum-drifter': return 'quantum';
    case 'tech-shaman': return 'circuit';
    case 'bio-hacker': return 'organic';
    case 'void-walker': return 'void';
    case 'nano-smith': return 'nano';
    case 'psy-scavenger': return 'psychic';
    default: return 'default';
  }
};

export const ClassBackgroundEffects: React.FC<{ characterClass: CharacterClass }> = ({ characterClass }) => {
  const effectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const effects = effectsRef.current;
    if (!effects) return;

    // Create class-specific particle effects
    const particleSystem = createParticleSystem(characterClass);
    effects.appendChild(particleSystem);

    return () => {
      if (effects.contains(particleSystem)) {
        effects.removeChild(particleSystem);
      }
    };
  }, [characterClass]);

  return (
    <div
      ref={effectsRef}
      className={`class-effects absolute inset-0 ${getClassEffectClasses(characterClass.id)}`}
      style={{
        background: getClassBackgroundGradient(characterClass),
        filter: getClassFilter(characterClass.id)
      }}
    />
  );
};