import { z } from 'zod';
import {
  PlayerSchema,
  GameCommandRequestSchema,
  CreatePlayerRequestSchema,
  UpdatePlayerRequestSchema,
  AIProxyRequestSchema
} from './schemas';

// Test Zod validation
const testSchemas = () => {
  console.log('🧪 Testing Zod schemas validation...');

  // Test valid player data
  const validPlayer = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'TestPlayer',
    emoji: '👨',
    position: { x: 10, y: 20 },
    color: { r: 255, g: 128, b: 64, a: 1 },
    class: 'mage',
    health: 85,
    maxHealth: 100,
    experience: 1500,
    level: 5,
    inventory: ['health_potion', 'mana_potion'],
    statusEffects: ['haste'],
    lastActive: new Date().toISOString(),
    isHandDrawn: false,
    combatStyle: 'balanced',
    lootPreferences: ['magic', 'gems'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const validatedPlayer = PlayerSchema.parse(validPlayer);
    console.log('✅ Player schema validation passed');
  } catch (error) {
    console.error('❌ Player schema validation failed:', error);
  }

  // Test invalid player data
  const invalidPlayer = {
    ...validPlayer,
    name: '', // Invalid: empty string
    health: 150, // Invalid: exceeds maxHealth
  };

  try {
    PlayerSchema.parse(invalidPlayer);
    console.error('❌ Should have failed validation for invalid player');
  } catch (error) {
    console.log('✅ Correctly rejected invalid player data');
  }

  // Test game command validation
  const validCommand = {
    playerId: '550e8400-e29b-41d4-a716-446655440000',
    command: 'attack',
    args: ['enemy1']
  };

  try {
    GameCommandRequestSchema.parse(validCommand);
    console.log('✅ Game command schema validation passed');
  } catch (error) {
    console.error('❌ Game command schema validation failed:', error);
  }

  // Test AI proxy validation
  const validAIRequest = {
    prompt: 'Generate a game suggestion',
    model: 'gemini-pro',
    context: 'Player is in a forest'
  };

  try {
    AIProxyRequestSchema.parse(validAIRequest);
    console.log('✅ AI proxy schema validation passed');
  } catch (error) {
    console.error('❌ AI proxy schema validation failed:', error);
  }

  console.log('🎉 All Zod schema validation tests completed');
};

testSchemas();