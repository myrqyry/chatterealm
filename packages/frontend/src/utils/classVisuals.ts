import { CharacterClass } from "shared";

export const getClassBackgroundGradient = (characterClass: CharacterClass): string => {
  return `radial-gradient(circle at center, ${characterClass.primaryColor}20 0%, ${characterClass.secondaryColor}10 50%, transparent 100%)`;
};

export const getClassEffectClasses = (classId: string): string => {
  const baseClasses = 'opacity-30 mix-blend-overlay';

  switch (classId) {
    case 'quantum-drifter': return `${baseClasses} animate-pulse`;
    case 'tech-shaman': return `${baseClasses} animate-bounce`;
    case 'bio-hacker': return `${baseClasses} animate-ping`;
    case 'void-walker': return `${baseClasses} animate-spin`;
    case 'nano-smith': return `${baseClasses} animate-pulse`;
    case 'psy-scavenger': return `${baseClasses} animate-pulse`;
    default: return baseClasses;
  }
};

export const getClassFilter = (classId: string): string => {
  switch (classId) {
    case 'quantum-drifter': return 'blur(0.5px) brightness(1.1)';
    case 'tech-shaman': return 'contrast(1.2) saturate(1.1)';
    case 'bio-hacker': return 'hue-rotate(15deg) saturate(1.2)';
    case 'void-walker': return 'contrast(1.3) brightness(0.8)';
    case 'nano-smith': return 'brightness(1.1) contrast(1.1)';
    case 'psy-scavenger': return 'hue-rotate(-15deg) saturate(1.3)';
    default: return 'none';
  }
};