export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  lore: string;

  // Visual properties
  primaryColor: string;
  secondaryColor: string;
  roughnessBase: number;
  animationSpeed: number;

  // Base stats
  baseStats: {
    vitality: number;    // Health and stamina
    intellect: number;   // Tech/magic power, crafting
    agility: number;     // Movement, dodge, attack speed
    perception: number;  // Detection, accuracy, loot finding
    resonance: number;   // Techno-magic affinity
    scavenge: number;    // Resource finding and efficiency
  };

  // Special abilities
  abilities: ClassAbility[];

  // Resource management
  primaryResource: ResourceType;
  resourceGeneration: number;

  // Progression
  statGrowth: StatGrowth;
  unlockableSkills: string[];

  // Gameplay modifiers
  movementSpeedMod: number;
  lootFindingMod: number;
  craftingSpeedMod: number;
  combatStylePreference: CombatStyle;
}

export enum ResourceType {
  QUANTUM_FLUX = 'quantum_flux',      // Reality manipulation energy
  BIO_ESSENCE = 'bio_essence',        // Life force energy
  TECH_CHARGE = 'tech_charge',        // Technological power
  VOID_ENERGY = 'void_energy',        // Dark energy
  NANO_MASS = 'nano_mass',           // Programmable matter
  PSY_POTENTIAL = 'psy_potential'     // Psychic energy
}

export interface ClassAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  resourceCost: number;
  effect: AbilityEffect;
  unlockLevel: number;
}

export interface StatGrowth {
  vitality: number;      // Multiplier per level (1.0 = no growth, 2.0 = doubles per level)
  intellect: number;
  agility: number;
  perception: number;
  resonance: number;
  scavenge: number;
}

export interface AbilityEffect {
  type: 'phase' | 'luck_boost' | 'link' | 'tech_control' | 'repair' | 'shield' |
        'resistance' | 'heal' | 'area_buff' | 'drain' | 'stealth' | 'area_damage' |
        'transmute' | 'repair_or_heal' | 'instant_craft' | 'reveal' | 'analyze' | 'area_debuff';
  duration?: number;     // Effect duration in milliseconds
  amount?: number;       // Healing/damage/repair amount
  range?: number;        // Effect range in grid cells
  modifier?: number;     // Multiplier for various effects
  dodgeChance?: number;  // For phase abilities
  shareRatio?: number;   // For link abilities
  absorption?: number;   // For shield abilities
  types?: string[];      // For resistance or reveal abilities
  stats?: string[];      // Which stats to buff
  heals_self?: boolean;  // For drain abilities
  detection_chance?: number; // For stealth abilities
  damage?: number;       // For damage abilities
  efficiency?: number;   // For crafting abilities
  target?: string;       // What the ability targets
  tier?: string;         // For crafting tiers
  cost_reduction?: number; // Cost reduction multiplier
  reveals?: string[];    // What information is revealed
  effects?: string[];    // Status effects applied
}

export enum CombatStyle {
  AGGRESSIVE = 'aggressive',     // High damage, low defense
  DEFENSIVE = 'defensive',       // High defense, moderate damage
  EVASIVE = 'evasive',          // High dodge, moderate damage
  SUPPORTIVE = 'supportive',     // Buffs allies, moderate combat
  ADAPTIVE = 'adaptive',         // Balanced, situational bonuses
  ASSASSIN = 'assassin',         // High crit, low health
  CRAFTING_FOCUSED = 'crafting', // Combat via items/traps
  RECONNAISSANCE = 'recon'       // Information gathering, moderate combat
}

export interface CharacterVisual {
  id: string;
  baseEmoji: string;
  baseSvg: string;
  animationFrames: string[];
  characterClass: CharacterClass;
  animationSpeed: number;
  roughnessVariation: number;
}

// Define the six character classes
export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: 'quantum-drifter',
    name: 'Quantum Drifter',
    description: 'Masters of probability and phase manipulation',
    lore: 'Once theoretical physicists, these survivors learned to bend quantum mechanics to their will. They exist partially outside reality, able to phase through matter and manipulate probability fields.',

    primaryColor: '#4facfe',
    secondaryColor: '#00f2fe',
    roughnessBase: 1.8,
    animationSpeed: 150,

    baseStats: {
      vitality: 7,
      intellect: 9,
      agility: 8,
      perception: 6,
      resonance: 10,
      scavenge: 5
    },

    abilities: [
      {
        id: 'phase_walk',
        name: 'Phase Walk',
        description: 'Briefly phase out of reality to pass through obstacles and avoid damage',
        cooldown: 12000,
        resourceCost: 30,
        effect: { type: 'phase', duration: 3000, dodgeChance: 0.8 },
        unlockLevel: 1
      },
      {
        id: 'probability_shift',
        name: 'Probability Shift',
        description: 'Alter the odds of finding rare loot or landing critical hits',
        cooldown: 20000,
        resourceCost: 40,
        effect: { type: 'luck_boost', duration: 10000, modifier: 2.5 },
        unlockLevel: 3
      },
      {
        id: 'quantum_entangle',
        name: 'Quantum Entangle',
        description: 'Link with another entity to share damage or benefits',
        cooldown: 30000,
        resourceCost: 50,
        effect: { type: 'link', duration: 15000, shareRatio: 0.5 },
        unlockLevel: 5
      }
    ],

    primaryResource: ResourceType.QUANTUM_FLUX,
    resourceGeneration: 2.5,

    statGrowth: {
      vitality: 1.2,
      intellect: 1.8,
      agility: 1.5,
      perception: 1.1,
      resonance: 2.0,
      scavenge: 0.8
    },

    unlockableSkills: [
      'quantum_tunneling', 'reality_anchor', 'probability_storm', 'phase_strike'
    ],

    movementSpeedMod: 1.1,
    lootFindingMod: 1.3,
    craftingSpeedMod: 0.9,
    combatStylePreference: CombatStyle.EVASIVE
  },

  {
    id: 'tech-shaman',
    name: 'Tech Shaman',
    description: 'Hybrid technomancers who commune with machine spirits',
    lore: 'These survivors discovered that ancient AIs developed consciousness and can be communed with like spirits. They blend ritualistic practices with advanced technology.',

    primaryColor: '#ff6b6b',
    secondaryColor: '#feca57',
    roughnessBase: 2.2,
    animationSpeed: 200,

    baseStats: {
      vitality: 8,
      intellect: 10,
      agility: 6,
      perception: 7,
      resonance: 9,
      scavenge: 7
    },

    abilities: [
      {
        id: 'machine_communion',
        name: 'Machine Communion',
        description: 'Communicate with and temporarily control nearby electronics',
        cooldown: 15000,
        resourceCost: 25,
        effect: { type: 'tech_control', duration: 8000, range: 3 },
        unlockLevel: 1
      },
      {
        id: 'spirit_repair',
        name: 'Spirit Repair',
        description: 'Channel machine spirits to repair equipment instantly',
        cooldown: 25000,
        resourceCost: 35,
        effect: { type: 'repair', amount: 75, target: 'equipment' },
        unlockLevel: 2
      },
      {
        id: 'digital_sanctuary',
        name: 'Digital Sanctuary',
        description: 'Create a protective tech field that deflects attacks',
        cooldown: 35000,
        resourceCost: 60,
        effect: { type: 'shield', duration: 12000, absorption: 100 },
        unlockLevel: 4
      }
    ],

    primaryResource: ResourceType.TECH_CHARGE,
    resourceGeneration: 3.0,

    statGrowth: {
      vitality: 1.4,
      intellect: 1.9,
      agility: 0.9,
      perception: 1.3,
      resonance: 1.7,
      scavenge: 1.4
    },

    unlockableSkills: [
      'overcharge', 'tech_savant', 'ai_whispers', 'electromagnetic_pulse'
    ],

    movementSpeedMod: 0.95,
    lootFindingMod: 1.4,
    craftingSpeedMod: 1.5,
    combatStylePreference: CombatStyle.SUPPORTIVE
  },

  {
    id: 'bio-hacker',
    name: 'Bio-Hacker',
    description: 'Genetic manipulators who reshape flesh and bone',
    lore: 'Former bioengineers who merged with their own experimental organisms. Their bodies are living laboratories, constantly adapting and evolving.',

    primaryColor: '#26de81',
    secondaryColor: '#20bf6b',
    roughnessBase: 2.5,
    animationSpeed: 180,

    baseStats: {
      vitality: 10,
      intellect: 8,
      agility: 7,
      perception: 8,
      resonance: 6,
      scavenge: 8
    },

    abilities: [
      {
        id: 'adaptive_mutation',
        name: 'Adaptive Mutation',
        description: 'Temporarily evolve resistance to environmental hazards',
        cooldown: 18000,
        resourceCost: 30,
        effect: { type: 'resistance', duration: 15000, types: ['poison', 'radiation'] },
        unlockLevel: 1
      },
      {
        id: 'bio_regeneration',
        name: 'Bio-Regeneration',
        description: 'Rapidly heal wounds by accelerating cellular repair',
        cooldown: 20000,
        resourceCost: 40,
        effect: { type: 'heal', amount: 60, duration: 5000 },
        unlockLevel: 2
      },
      {
        id: 'symbiotic_burst',
        name: 'Symbiotic Burst',
        description: 'Release beneficial organisms that boost nearby allies',
        cooldown: 30000,
        resourceCost: 50,
        effect: { type: 'area_buff', range: 2, duration: 12000, stats: ['vitality', 'agility'] },
        unlockLevel: 4
      }
    ],

    primaryResource: ResourceType.BIO_ESSENCE,
    resourceGeneration: 2.8,

    statGrowth: {
      vitality: 2.1,
      intellect: 1.4,
      agility: 1.3,
      perception: 1.5,
      resonance: 1.0,
      scavenge: 1.6
    },

    unlockableSkills: [
      'toxin_immunity', 'predator_instincts', 'viral_warfare', 'metamorphosis'
    ],

    movementSpeedMod: 1.05,
    lootFindingMod: 1.2,
    craftingSpeedMod: 1.1,
    combatStylePreference: CombatStyle.ADAPTIVE
  },

  {
    id: 'void-walker',
    name: 'Void Walker',
    description: 'Dark energy manipulators who embrace entropy',
    lore: 'Survivors who stared too long into the cosmic void and found it staring back. They wield the fundamental force of entropy itself.',

    primaryColor: '#2d3436',
    secondaryColor: '#6c5ce7',
    roughnessBase: 3.0,
    animationSpeed: 120,

    baseStats: {
      vitality: 6,
      intellect: 9,
      agility: 9,
      perception: 10,
      resonance: 8,
      scavenge: 5
    },

    abilities: [
      {
        id: 'entropy_drain',
        name: 'Entropy Drain',
        description: 'Siphon energy from living beings and technology',
        cooldown: 14000,
        resourceCost: 20,
        effect: { type: 'drain', amount: 40, range: 1, heals_self: true },
        unlockLevel: 1
      },
      {
        id: 'void_cloak',
        name: 'Void Cloak',
        description: 'Become nearly invisible to enemies and sensors',
        cooldown: 22000,
        resourceCost: 35,
        effect: { type: 'stealth', duration: 8000, detection_chance: 0.1 },
        unlockLevel: 3
      },
      {
        id: 'reality_tear',
        name: 'Reality Tear',
        description: 'Create a temporary rift that damages everything nearby',
        cooldown: 40000,
        resourceCost: 70,
        effect: { type: 'area_damage', range: 2, damage: 120, duration: 3000 },
        unlockLevel: 5
      }
    ],

    primaryResource: ResourceType.VOID_ENERGY,
    resourceGeneration: 2.2,

    statGrowth: {
      vitality: 0.8,
      intellect: 1.6,
      agility: 1.7,
      perception: 1.9,
      resonance: 1.5,
      scavenge: 0.7
    },

    unlockableSkills: [
      'shadow_step', 'entropy_mastery', 'void_sight', 'oblivion_strike'
    ],

    movementSpeedMod: 1.2,
    lootFindingMod: 0.8,
    craftingSpeedMod: 0.8,
    combatStylePreference: CombatStyle.ASSASSIN
  },

  {
    id: 'nano-smith',
    name: 'Nano-Smith',
    description: 'Masters of programmable matter and molecular assembly',
    lore: 'Engineers who integrated nanobots into their bloodstream. They can reshape matter at the molecular level and craft anything from raw materials.',

    primaryColor: '#74b9ff',
    secondaryColor: '#0984e3',
    roughnessBase: 1.5,
    animationSpeed: 160,

    baseStats: {
      vitality: 8,
      intellect: 10,
      agility: 6,
      perception: 9,
      resonance: 7,
      scavenge: 10
    },

    abilities: [
      {
        id: 'matter_reshape',
        name: 'Matter Reshape',
        description: 'Transform basic materials into useful items',
        cooldown: 10000,
        resourceCost: 25,
        effect: { type: 'transmute', efficiency: 1.5, range: 1 },
        unlockLevel: 1
      },
      {
        id: 'nano_repair',
        name: 'Nano Repair',
        description: 'Use nanobots to repair equipment or heal wounds',
        cooldown: 16000,
        resourceCost: 30,
        effect: { type: 'repair_or_heal', amount: 50, target: 'any' },
        unlockLevel: 2
      },
      {
        id: 'molecular_assembly',
        name: 'Molecular Assembly',
        description: 'Instantly craft complex items from raw materials',
        cooldown: 45000,
        resourceCost: 80,
        effect: { type: 'instant_craft', tier: 'advanced', cost_reduction: 0.5 },
        unlockLevel: 6
      }
    ],

    primaryResource: ResourceType.NANO_MASS,
    resourceGeneration: 3.2,

    statGrowth: {
      vitality: 1.3,
      intellect: 1.8,
      agility: 0.9,
      perception: 1.6,
      resonance: 1.2,
      scavenge: 2.0
    },

    unlockableSkills: [
      'resource_multiplier', 'nano_swarm', 'matter_analysis', 'atomic_forge'
    ],

    movementSpeedMod: 0.9,
    lootFindingMod: 2.0,
    craftingSpeedMod: 2.5,
    combatStylePreference: CombatStyle.CRAFTING_FOCUSED
  },

  {
    id: 'psy-scavenger',
    name: 'Psy-Scavenger',
    description: 'Psychic wasteland nomads with enhanced intuition',
    lore: 'Radiation and desperation awakened latent psychic abilities. They feel the emotional echoes of abandoned places and can sense valuable resources.',

    primaryColor: '#fd79a8',
    secondaryColor: '#e84393',
    roughnessBase: 2.8,
    animationSpeed: 140,

    baseStats: {
      vitality: 7,
      intellect: 8,
      agility: 9,
      perception: 10,
      resonance: 9,
      scavenge: 9
    },

    abilities: [
      {
        id: 'psychic_scan',
        name: 'Psychic Scan',
        description: 'Sense nearby enemies, loot, and environmental hazards',
        cooldown: 12000,
        resourceCost: 20,
        effect: { type: 'reveal', range: 4, duration: 8000, types: ['enemies', 'loot', 'hazards'] },
        unlockLevel: 1
      },
      {
        id: 'emotional_echo',
        name: 'Emotional Echo',
        description: 'Read the history of items and locations for hidden information',
        cooldown: 20000,
        resourceCost: 30,
        effect: { type: 'analyze', reveals: ['item_history', 'hidden_caches', 'safe_paths'] },
        unlockLevel: 2
      },
      {
        id: 'psychic_storm',
        name: 'Psychic Storm',
        description: 'Unleash a wave of mental energy that confuses enemies',
        cooldown: 35000,
        resourceCost: 60,
        effect: { type: 'area_debuff', range: 3, duration: 10000, effects: ['confusion', 'fear'] },
        unlockLevel: 5
      }
    ],

    primaryResource: ResourceType.PSY_POTENTIAL,
    resourceGeneration: 2.7,

    statGrowth: {
      vitality: 1.1,
      intellect: 1.5,
      agility: 1.6,
      perception: 1.9,
      resonance: 1.7,
      scavenge: 1.8
    },

    unlockableSkills: [
      'danger_sense', 'treasure_hunter', 'mind_link', 'psychic_shield'
    ],

    movementSpeedMod: 1.15,
    lootFindingMod: 1.8,
    craftingSpeedMod: 1.0,
    combatStylePreference: CombatStyle.RECONNAISSANCE
  }
];