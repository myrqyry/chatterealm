import { PlayerEffect } from '../../types/playerStatus';
import { Buff } from '@shared/types/game'; // Import Buff enum

export const getEffectDescription = (effect: PlayerEffect): string => {
  switch (effect.type) {
    case Buff.HealthRegen:
      return `Health Regen (+${effect.strength} HP/turn, ${effect.duration} turns left)`;
    case Buff.ManaRegen:
      return `Mana Regen (+${effect.strength} MP/turn, ${effect.duration} turns left)`;
    case Buff.DamageBoost:
      return `Damage Boost (+${effect.strength} DMG, ${effect.duration} turns left)`;
    case Buff.SpeedBoost:
      return `Speed Boost (+${effect.strength} SPD, ${effect.duration} turns left)`;
    default:
      return `${effect.type} (Strength: ${effect.strength}, Duration: ${effect.duration} turns left)`;
  }
};