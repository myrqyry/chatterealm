import { Server, Socket } from 'socket.io';
import { GameStateManager } from '../services/gameStateManager';
import { Player, PlayerClass, CHARACTER_CLASSES } from 'shared';

export class CharacterHandler {
  constructor(
    private io: Server,
    private gameStateManager: GameStateManager
  ) {}

  public handleCreateCharacter(socket: Socket, data: any): void {
    try {
      const { characterData } = data;

      if (!this.validateCharacterData(characterData)) {
        socket.emit('error', { message: 'Invalid character data received.' });
        console.error('Invalid character data:', characterData);
        return;
      }

      // The GameStateManager will find a suitable spawn position.
      // We provide a placeholder position here.
      const player: Player = {
        id: characterData.id,
        name: characterData.name,
        displayName: characterData.name,
        avatar: characterData.emoji,
        position: { x: -1, y: -1 },

        // New character class system fields
        characterClass: characterData.characterClass,
        visual: characterData.visual,
        characterStats: { ...characterData.characterClass.baseStats },
        abilities: characterData.characterClass.abilities.filter((a: any) => a.unlockLevel <= 1),
        resources: {
          [characterData.characterClass.primaryResource]: 100
        },

        // Legacy fields for backward compatibility
        class: PlayerClass.KNIGHT, // Default legacy class
        stats: { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 5 }, // Default legacy stats
        health: 100,
        mana: 50,
        stamina: 100,
        hunger: 100,
        thirst: 100,

        // Standard player fields
        level: 1,
        experience: 0,
        inventory: [],
        equipment: {},
        achievements: [],
        titles: [],
        isAlive: true,
        lastMoveTime: Date.now(),
        spawnTime: Date.now(),
        connected: true,
        lastActive: Date.now(),
        buffs: [],
      };

      // Add the new player to the game world
      const success = this.gameStateManager.addPlayer(player);

      if (success) {
        socket.emit('character_created', {
          success: true,
          player: player
        });

        // Notify other players in the game that a new player has joined
        socket.broadcast.emit('player_joined', { player });

        console.log(`Player ${player.name} (${player.id}) created and joined the game.`);
      } else {
        socket.emit('character_created', {
          success: false,
          error: 'Failed to add character to the game world.'
        });
      }
    } catch (error) {
      console.error('An error occurred during character creation:', error);
      socket.emit('error', { message: 'A server error occurred during character creation.' });
    }
  }

  private validateCharacterData(data: any): boolean {
    if (!data || !data.id || !data.name || !data.emoji || !data.characterClass) {
      return false;
    }
    const classExists = CHARACTER_CLASSES.some(c => c.id === data.characterClass.id);
    if (!classExists) {
      return false;
    }
    return true;
  }
}