import { Server } from 'socket.io';
import axios from 'axios';
import * as tmi from 'tmi.js';
import { GameStateManager } from './gameStateManager';

// Twitch IRC message types
interface TwitchMessage {
  username: string;
  displayName: string;
  message: string;
  timestamp: number;
  isSubscriber: boolean;
  isModerator: boolean;
  isBroadcaster: boolean;
  channelPoints?: number;
}

interface ChatCommand {
  command: string;
  args: string[];
  username: string;
  displayName: string;
  userId: string;
  channelPoints: number;
  timestamp: number;
}

interface CommandHandler {
  command: string;
  handler: (cmd: ChatCommand) => Promise<string>;
  cooldown: number; // milliseconds
  requiredPoints?: number;
}

export class TwitchService {
  private io: Server;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string = '';
  private channelName: string;
  private commandCooldowns: Map<string, number> = new Map();
  private userCooldowns: Map<string, number> = new Map();
  private globalCooldowns: Map<string, number> = new Map();
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private tmiClient: tmi.Client | null = null;
  private gameStateManager: GameStateManager;
  private connected: boolean = false;

  // Rate limiting configuration
  private readonly GLOBAL_COOLDOWN_MS = 500; // 500ms between any commands
  private readonly MAX_COMMANDS_PER_MINUTE = 30;
  private readonly COMMAND_WINDOW_MS = 60000; // 1 minute window
  private commandCounts: Map<string, { count: number; windowStart: number }> = new Map();

  // Logging methods
  private logCommand(command: string, username: string, success: boolean, error?: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      command,
      username,
      success,
      error: error || null
    };

    console.log(`[COMMAND] ${JSON.stringify(logEntry)}`);

    // Could also write to a file or external logging service
    // this.writeToLogFile(logEntry);
  }

  private logConnectionEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details: details || null
    };

    console.log(`[CONNECTION] ${JSON.stringify(logEntry)}`);
  }

  private logError(context: string, error: any, username?: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      context,
      username: username || null,
      error: error.message || error,
      stack: error.stack || null
    };

    console.error(`[ERROR] ${JSON.stringify(logEntry)}`);
  }

  constructor(io: Server, clientId: string, clientSecret: string, channelName: string, gameStateManager: GameStateManager) {
    this.io = io;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.channelName = channelName;
    this.gameStateManager = gameStateManager;

    this.initializeCommandHandlers();
    this.registerCommandAliases();
    this.initializeTmiClient();
  }

  private initializeTmiClient(): void {
    // Initialize tmi.js client
    this.tmiClient = new tmi.Client({
      options: {
        debug: true,
        messagesLogLevel: 'info'
      },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: process.env.TWITCH_BOT_USERNAME || 'your_bot_username',
        password: process.env.TWITCH_OAUTH_TOKEN || 'oauth:your_oauth_token'
      },
      channels: [this.channelName]
    });

    // Set up event listeners
    this.tmiClient.on('message', this.handleChatMessage.bind(this));
    this.tmiClient.on('connected', this.onConnected.bind(this));
    this.tmiClient.on('disconnected', this.onDisconnected.bind(this));
    this.tmiClient.on('join', this.onChannelJoin.bind(this));
    this.tmiClient.on('part', this.onChannelPart.bind(this));
  }

  private initializeCommandHandlers(): void {
    // !spawn command - join the game
    this.registerCommand('spawn', async (cmd: ChatCommand) => {
      if (cmd.args.length < 1) {
        return `@${cmd.displayName} Usage: !spawn <class> (knight/rogue/mage)`;
      }

      const playerClass = cmd.args[0].toLowerCase();
      const validClasses = ['knight', 'rogue', 'mage'];

      if (!validClasses.includes(playerClass)) {
        return `@${cmd.displayName} Invalid class! Choose: knight, rogue, or mage`;
      }

      // Check if player already exists
      const existingPlayer = this.getExistingPlayer(cmd.username);
      if (existingPlayer) {
        return `@${cmd.displayName} You're already in the game! Use !move to play.`;
      }

      // Check channel points cost (100 points)
      if (cmd.channelPoints < 100) {
        return `@${cmd.displayName} You need 100 channel points to spawn!`;
      }

      // Spawn the player using GameStateManager
      const result = await this.spawnPlayer(cmd.username, cmd.displayName, playerClass);

      if (result.success) {
        // Deduct channel points
        await this.deductChannelPoints(cmd.userId, 100);

        return `@${cmd.displayName} Welcome to Chat Grid Chronicles! You spawned as a ${playerClass}! Use !move to start playing.`;
      } else {
        return `@${cmd.displayName} Failed to spawn. The world might be full!`;
      }
    }, 5000, 100); // 5 second cooldown, 100 points

    // !move command - move player
    this.registerCommand('move', async (cmd: ChatCommand) => {
      if (cmd.args.length < 1) {
        return `@${cmd.displayName} Usage: !move <direction> (up/down/left/right)`;
      }

      const direction = cmd.args[0].toLowerCase();
      const validDirections = ['up', 'down', 'left', 'right'];

      if (!validDirections.includes(direction)) {
        return `@${cmd.displayName} Invalid direction! Use: up, down, left, or right`;
      }

      // Check if player exists
      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      // Execute move using GameStateManager
      const result = this.gameStateManager.movePlayer(cmd.username, direction as any);

      if (result.success) {
        return `@${cmd.displayName} Moved ${direction}!`;
      } else {
        return `@${cmd.displayName} ${result.message || 'Cannot move there!'}`;
      }
    }, 1000); // 1 second cooldown

    // !up, !down, !left, !right commands - direct movement
    this.registerCommand('up', async (cmd: ChatCommand) => {
      return this.handleMovementCommand(cmd, 'up');
    }, 1000);

    this.registerCommand('down', async (cmd: ChatCommand) => {
      return this.handleMovementCommand(cmd, 'down');
    }, 1000);

    this.registerCommand('left', async (cmd: ChatCommand) => {
      return this.handleMovementCommand(cmd, 'left');
    }, 1000);

    this.registerCommand('right', async (cmd: ChatCommand) => {
      return this.handleMovementCommand(cmd, 'right');
    }, 1000);

    // !attack command - attack enemies
    this.registerCommand('attack', async (cmd: ChatCommand) => {
      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      // Find enemy at player's position
      const enemy = this.gameStateManager.getGameWorld().npcs.find(npc =>
        npc.position.x === player.position.x &&
        npc.position.y === player.position.y &&
        npc.isAlive
      );

      if (!enemy) {
        return `@${cmd.displayName} No enemy nearby to attack!`;
      }

      // Execute attack using GameStateManager
      const result = this.gameStateManager.attackEnemy(player, enemy);

      if (result.success) {
        return `@${cmd.displayName} ${result.message}`;
      } else {
        return `@${cmd.displayName} Attack failed!`;
      }
    }, 2000); // 2 second cooldown

    // !pickup command - pick up items
    this.registerCommand('pickup', async (cmd: ChatCommand) => {
      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      // Find items at player's position
      const items = this.gameStateManager.getGameWorld().items.filter(item =>
        item.position &&
        item.position.x === player.position.x &&
        item.position.y === player.position.y
      );

      if (items.length === 0) {
        return `@${cmd.displayName} No items nearby to pick up!`;
      }

      // Pick up the first item
      const result = this.gameStateManager.pickupItem(cmd.username, items[0].id);

      if (result.success) {
        return `@${cmd.displayName} ${result.message}`;
      } else {
        return `@${cmd.displayName} Failed to pick up item!`;
      }
    }, 2000); // 2 second cooldown

    // !status command - check player stats
    this.registerCommand('status', async (cmd: ChatCommand) => {
      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      const { stats, level, experience } = player;
      return `@${cmd.displayName} [${player.class}] Lvl ${level} | HP: ${stats.hp}/${stats.maxHp} | ATK: ${stats.attack} | DEF: ${stats.defense} | XP: ${experience}`;
    }, 3000); // 3 second cooldown

    // !inventory command - check player inventory
    this.registerCommand('inventory', async (cmd: ChatCommand) => {
      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      if (player.inventory.length === 0) {
        return `@${cmd.displayName} Your inventory is empty!`;
      }

      const items = player.inventory.map((item: any) => `${item.name} (${item.rarity})`).join(', ');
      return `@${cmd.displayName} Inventory: ${items}`;
    }, 3000); // 3 second cooldown

    // !use command - use an item from inventory
    this.registerCommand('use', async (cmd: ChatCommand) => {
      if (cmd.args.length < 1) {
        return `@${cmd.displayName} Usage: !use <item_name>`;
      }

      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      const itemName = cmd.args.join(' ').toLowerCase();
      const item = player.inventory.find((item: any) =>
        item.name.toLowerCase().includes(itemName)
      );

      if (!item) {
        return `@${cmd.displayName} Item not found in your inventory!`;
      }

      const result = this.gameStateManager.useItem(cmd.username, item.id);

      if (result.success) {
        return `@${cmd.displayName} ${result.message}`;
      } else {
        return `@${cmd.displayName} Failed to use item!`;
      }
    }, 2000); // 2 second cooldown

    // !stats command - alias for !status
    this.registerCommand('stats', async (cmd: ChatCommand) => {
      return this.commandHandlers.get('status')!.handler(cmd);
    }, 3000); // 3 second cooldown

    // !info command - get information about the game
    this.registerCommand('info', async (cmd: ChatCommand) => {
      const world = this.gameStateManager.getGameWorld();
      const playerCount = world.players.filter(p => p.isAlive).length;
      const npcCount = world.npcs.filter(n => n.isAlive).length;
      const itemCount = world.items.length;

      return `@${cmd.displayName} Chat Grid Chronicles - Players: ${playerCount}, NPCs: ${npcCount}, Items: ${itemCount}. Use !help for commands!`;
    }, 5000); // 5 second cooldown

    // !leaderboard command - show top players
    this.registerCommand('leaderboard', async (cmd: ChatCommand) => {
      const world = this.gameStateManager.getGameWorld();
      const topPlayers = world.players
        .filter(p => p.isAlive)
        .sort((a, b) => b.level - a.level || b.experience - a.experience)
        .slice(0, 5);

      if (topPlayers.length === 0) {
        return `@${cmd.displayName} No players in the game yet!`;
      }

      const leaderboard = topPlayers.map((player, index) =>
        `${index + 1}. ${player.displayName} (Lvl ${player.level})`
      ).join(', ');

      return `@${cmd.displayName} Top Players: ${leaderboard}`;
    }, 5000); // 5 second cooldown

    // !class command - change class (with cost)
    this.registerCommand('class', async (cmd: ChatCommand) => {
      if (cmd.args.length < 1) {
        return `@${cmd.displayName} Usage: !class <new_class> (knight/rogue/mage)`;
      }

      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      const newClass = cmd.args[0].toLowerCase();
      const validClasses = ['knight', 'rogue', 'mage'];

      if (!validClasses.includes(newClass)) {
        return `@${cmd.displayName} Invalid class! Choose: knight, rogue, or mage`;
      }

      if (player.class === newClass) {
        return `@${cmd.displayName} You're already a ${newClass}!`;
      }

      // Check channel points cost (200 points for class change)
      if (cmd.channelPoints < 200) {
        return `@${cmd.displayName} You need 200 channel points to change class!`;
      }

      // Change class and update stats
      player.class = newClass as any;
      player.stats = this.getPlayerStatsForClass(newClass);

      // Deduct channel points
      await this.deductChannelPoints(cmd.userId, 200);

      return `@${cmd.displayName} Class changed to ${newClass}! Stats updated.`;
    }, 10000, 200); // 10 second cooldown, 200 points

    // !rest command - heal at spawn (with cost)
    this.registerCommand('rest', async (cmd: ChatCommand) => {
      const player = this.getExistingPlayer(cmd.username);
      if (!player) {
        return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
      }

      if (player.stats.hp >= player.stats.maxHp) {
        return `@${cmd.displayName} You're already at full health!`;
      }

      // Check channel points cost (50 points for rest)
      if (cmd.channelPoints < 50) {
        return `@${cmd.displayName} You need 50 channel points to rest and heal!`;
      }

      // Heal player to full
      const healAmount = player.stats.maxHp - player.stats.hp;
      player.stats.hp = player.stats.maxHp;

      // Deduct channel points
      await this.deductChannelPoints(cmd.userId, 50);

      return `@${cmd.displayName} Rested and healed for ${healAmount} HP!`;
    }, 30000, 50); // 30 second cooldown, 50 points

    // !commands command - show available commands (alias for help)
    this.registerCommand('commands', async (cmd: ChatCommand) => {
      return this.commandHandlers.get('help')!.handler(cmd);
    }, 5000); // 5 second cooldown

    // !help command - show available commands
    this.registerCommand('help', async (cmd: ChatCommand) => {
      const commands = [
        '!spawn <class> - Join the game (100 points)',
        '!move <direction> - Move your character',
        '!up/!down/!left/!right - Quick movement',
        '!attack - Attack nearby enemies',
        '!pickup - Pick up nearby items',
        '!inventory - Check your items',
        '!use <item> - Use an item',
        '!status/!stats - Check your stats',
        '!class <new_class> - Change class (200 points)',
        '!rest - Heal to full (50 points)',
        '!leaderboard - Show top players',
        '!info - Game information',
        '!help - Show this message'
      ];

      return `@${cmd.displayName} Available commands: ${commands.join(' | ')}`;
    }, 5000); // 5 second cooldown
  }

  private handleMovementCommand(cmd: ChatCommand, direction: 'up' | 'down' | 'left' | 'right'): string {
    const player = this.getExistingPlayer(cmd.username);
    if (!player) {
      return `@${cmd.displayName} You haven't spawned yet! Use !spawn first.`;
    }

    const result = this.gameStateManager.movePlayer(cmd.username, direction);

    if (result.success) {
      return `@${cmd.displayName} Moved ${direction}!`;
    } else {
      return `@${cmd.displayName} ${result.message || 'Cannot move there!'}`;
    }
  }

  private registerCommand(
    command: string,
    handler: (cmd: ChatCommand) => Promise<string>,
    cooldown: number,
    requiredPoints?: number
  ): void {
    this.commandHandlers.set(command, {
      command,
      handler,
      cooldown,
      requiredPoints
    });
  }

  private registerCommandAlias(alias: string, targetCommand: string): void {
    const targetHandler = this.commandHandlers.get(targetCommand);
    if (targetHandler) {
      this.commandHandlers.set(alias, targetHandler);
    }
  }

  private registerCommandAliases(): void {
    // Register common aliases
    this.registerCommandAlias('s', 'status'); // !s -> !status
    this.registerCommandAlias('i', 'inventory'); // !i -> !inventory
    this.registerCommandAlias('m', 'move'); // !m -> !move
    this.registerCommandAlias('a', 'attack'); // !a -> !attack
    this.registerCommandAlias('p', 'pickup'); // !p -> !pickup
    this.registerCommandAlias('h', 'help'); // !h -> !help
    this.registerCommandAlias('l', 'leaderboard'); // !l -> !leaderboard
    this.registerCommandAlias('r', 'rest'); // !r -> !rest

    // Movement aliases
    this.registerCommandAlias('u', 'up'); // !u -> !up
    this.registerCommandAlias('d', 'down'); // !d -> !down
    this.registerCommandAlias('l', 'left'); // !l -> !left (conflicts with leaderboard, so skip)
    this.registerCommandAlias('rt', 'right'); // !rt -> !right

    // Alternative command formats
    this.registerCommandAlias('join', 'spawn'); // !join -> !spawn
    this.registerCommandAlias('enter', 'spawn'); // !enter -> !spawn
    this.registerCommandAlias('fight', 'attack'); // !fight -> !attack
    this.registerCommandAlias('grab', 'pickup'); // !grab -> !pickup
    this.registerCommandAlias('take', 'pickup'); // !take -> !pickup
    this.registerCommandAlias('heal', 'rest'); // !heal -> !rest
    this.registerCommandAlias('sleep', 'rest'); // !sleep -> !rest
  }

  // TMI.js event handlers
  private async handleChatMessage(channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean): Promise<void> {
    // Don't process our own messages
    if (self) return;

    // Convert tmi.js message to our TwitchMessage format
    const twitchMessage: TwitchMessage = {
      username: userstate.username || 'unknown',
      displayName: userstate['display-name'] || userstate.username || 'Unknown',
      message: message,
      timestamp: Date.now(),
      isSubscriber: userstate.subscriber || false,
      isModerator: userstate.mod || false,
      isBroadcaster: userstate.badges?.broadcaster === '1' || false,
      channelPoints: 0 // Would need to implement channel point redemption handling
    };

    await this.processChatMessage(twitchMessage);
  }

  private onConnected(addr: string, port: number): void {
    console.log(`🔗 Connected to Twitch IRC at ${addr}:${port}`);
    this.connected = true;
    this.logConnectionEvent('connected', { addr, port });

    // Send a welcome message to the channel
    if (this.tmiClient) {
      this.tmiClient.say(this.channelName, '🤖 Chat Grid Chronicles bot is now online! Type !help for commands.');
    }
  }

  private onDisconnected(reason: string): void {
    console.log(`🔌 Disconnected from Twitch IRC: ${reason}`);
    this.connected = false;
    this.logConnectionEvent('disconnected', { reason });
  }

  private onChannelJoin(channel: string, username: string, self: boolean): void {
    if (self) {
      console.log(`✅ Joined channel: ${channel}`);
    } else {
      console.log(`👤 ${username} joined ${channel}`);
    }
  }

  private onChannelPart(channel: string, username: string, self: boolean): void {
    if (self) {
      console.log(`❌ Left channel: ${channel}`);
    } else {
      console.log(`👋 ${username} left ${channel}`);
    }
  }

  // Rate limiting methods
  private checkGlobalCooldown(username: string): boolean {
    const lastCommand = this.globalCooldowns.get(username) || 0;
    return Date.now() - lastCommand >= this.GLOBAL_COOLDOWN_MS;
  }

  private checkCommandRateLimit(username: string): boolean {
    const now = Date.now();
    const userStats = this.commandCounts.get(username);

    if (!userStats) {
      this.commandCounts.set(username, { count: 1, windowStart: now });
      return true;
    }

    // Reset window if needed
    if (now - userStats.windowStart >= this.COMMAND_WINDOW_MS) {
      userStats.count = 1;
      userStats.windowStart = now;
      return true;
    }

    // Check if under limit
    if (userStats.count < this.MAX_COMMANDS_PER_MINUTE) {
      userStats.count++;
      return true;
    }

    return false;
  }

  private validateCommandInput(command: string, args: string[]): { valid: boolean; error?: string } {
    // Sanitize command name
    if (!/^[a-zA-Z]+$/.test(command)) {
      return { valid: false, error: 'Invalid command format' };
    }

    // Check for command injection attempts
    const fullCommand = `${command} ${args.join(' ')}`;
    if (fullCommand.includes('..') || fullCommand.includes('/') || fullCommand.includes('\\')) {
      return { valid: false, error: 'Invalid characters in command' };
    }

    // Validate argument count for specific commands
    const handler = this.commandHandlers.get(command);
    if (handler) {
      switch (command) {
        case 'spawn':
          if (args.length < 1) {
            return { valid: false, error: 'Missing class argument' };
          }
          break;
        case 'move':
          if (args.length < 1) {
            return { valid: false, error: 'Missing direction argument' };
          }
          break;
        case 'use':
          if (args.length < 1) {
            return { valid: false, error: 'Missing item name' };
          }
          break;
        case 'class':
          if (args.length < 1) {
            return { valid: false, error: 'Missing class argument' };
          }
          break;
      }
    }

    return { valid: true };
  }

  // Process incoming Twitch chat messages
  public async processChatMessage(twitchMessage: TwitchMessage): Promise<void> {
    // Check if message is a command
    if (!twitchMessage.message.startsWith('!')) {
      return; // Not a command
    }

    // Parse command
    const parts = twitchMessage.message.substring(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Validate command input
    const validation = this.validateCommandInput(command, args);
    if (!validation.valid) {
      await this.sendChatResponse(`@${twitchMessage.displayName} ${validation.error}`);
      return;
    }

    // Check if command exists
    const handler = this.commandHandlers.get(command);
    if (!handler) {
      return; // Unknown command
    }

    // Check global cooldown
    if (!this.checkGlobalCooldown(twitchMessage.username)) {
      return; // Global cooldown active
    }

    // Check rate limit
    if (!this.checkCommandRateLimit(twitchMessage.username)) {
      await this.sendChatResponse(`@${twitchMessage.displayName} Rate limit exceeded! Slow down.`);
      return;
    }

    // Check user cooldown
    const userKey = `${twitchMessage.username}:${command}`;
    const lastUsed = this.userCooldowns.get(userKey) || 0;
    if (Date.now() - lastUsed < handler.cooldown) {
      const remaining = Math.ceil((handler.cooldown - (Date.now() - lastUsed)) / 1000);
      await this.sendChatResponse(`@${twitchMessage.displayName} Command on cooldown! ${remaining}s remaining.`);
      return;
    }

    // Check channel points if required
    if (handler.requiredPoints && (twitchMessage.channelPoints || 0) < handler.requiredPoints) {
      const response = `@${twitchMessage.displayName} You need ${handler.requiredPoints} channel points for this command!`;
      await this.sendChatResponse(response);
      return;
    }

    // Create command object
    const chatCommand: ChatCommand = {
      command,
      args,
      username: twitchMessage.username,
      displayName: twitchMessage.displayName,
      userId: twitchMessage.username, // Would be actual user ID in real implementation
      channelPoints: twitchMessage.channelPoints || 0,
      timestamp: Date.now()
    };

    try {
      // Execute command
      const response = await handler.handler(chatCommand);

      // Send response to chat
      await this.sendChatResponse(response);

      // Update cooldowns
      this.userCooldowns.set(userKey, Date.now());
      this.globalCooldowns.set(twitchMessage.username, Date.now());

      // Log successful command
      this.logCommand(command, twitchMessage.username, true);

      // Broadcast to game clients
      this.io.emit('chat_command_processed', {
        command,
        username: twitchMessage.username,
        displayName: twitchMessage.displayName,
        success: true
      });

    } catch (error) {
      // Log error
      this.logError('command_processing', error, twitchMessage.username);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logCommand(command, twitchMessage.username, false, errorMessage);

      await this.sendChatResponse(`@${twitchMessage.displayName} Sorry, something went wrong! Please try again.`);

      // Broadcast error to game clients
      this.io.emit('chat_command_processed', {
        command,
        username: twitchMessage.username,
        displayName: twitchMessage.displayName,
        success: false,
        error: 'Command execution failed'
      });
    }
  }

  // Player management methods
  private async spawnPlayer(username: string, displayName: string, playerClass: string): Promise<{ success: boolean; player?: any; message?: string }> {
    try {
      // Create player object based on class
      const playerStats = this.getPlayerStatsForClass(playerClass);
      const player = {
        id: username,
        twitchUsername: username,
        displayName,
        avatar: this.getRandomAvatar(),
        position: { x: 0, y: 0 }, // Will be set by GameStateManager
        class: playerClass as any, // Cast to PlayerClass enum
        stats: playerStats,
        level: 1,
        experience: 0,
        inventory: [],
        equipment: {
          weapon: undefined,
          armor: undefined,
          accessory: undefined
        },
        achievements: [],
        titles: [],
        isAlive: true,
        lastMoveTime: 0,
        spawnTime: Date.now(),
        connected: true,
        lastActive: Date.now()
      };

      // Add player to game using GameStateManager
      const result = this.gameStateManager.addPlayer(player);

      if (result.success) {
        return { success: true, player: result.data.player };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error spawning player:', error);
      return { success: false, message: 'Failed to spawn player' };
    }
  }

  private getExistingPlayer(username: string): any {
    // Get player from GameStateManager
    return this.gameStateManager.getGameWorld().players.find(p => p.id === username);
  }

  private getPlayerStatsForClass(playerClass: string): any {
    const baseStats = {
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      speed: 5
    };

    // Class-specific stat modifiers
    switch (playerClass) {
      case 'knight':
        return { ...baseStats, defense: 8, attack: 12 };
      case 'rogue':
        return { ...baseStats, speed: 8, attack: 15 };
      case 'mage':
        return { ...baseStats, attack: 18, hp: 80, maxHp: 80 };
      default:
        return baseStats;
    }
  }

  private async deductChannelPoints(userId: string, points: number): Promise<boolean> {
    // This would call Twitch API to deduct points
    console.log(`Deducting ${points} points from user ${userId}`);
    return true;
  }

  private async sendChatResponse(message: string): Promise<void> {
    // Send message to Twitch chat via tmi.js
    if (this.tmiClient && this.connected) {
      try {
        await this.tmiClient.say(this.channelName, message);
      } catch (error) {
        console.error('Error sending chat response:', error);
      }
    } else {
      console.log(`[CHAT RESPONSE] ${message}`);
    }

    // Broadcast to frontend for display
    this.io.emit('chat_message', {
      message,
      timestamp: Date.now(),
      isResponse: true
    });
  }

  private getRandomAvatar(): string {
    const avatars = ['🤠', '⚔️', '🗡️', '🔮', '🏇', '🛡️', '⚡', '🔥'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  // Connect to Twitch using tmi.js
  public async connect(): Promise<void> {
    console.log('🔗 Connecting to Twitch...');

    if (!this.tmiClient) {
      throw new Error('TMI client not initialized');
    }

    try {
      await this.tmiClient.connect();
      console.log('✅ Twitch service connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Twitch:', error);
      throw error;
    }
  }

  // Disconnect from Twitch
  public async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting from Twitch...');

    if (this.tmiClient && this.connected) {
      try {
        await this.tmiClient.disconnect();
        this.connected = false;
        console.log('✅ Twitch service disconnected successfully');
      } catch (error) {
        console.error('❌ Error disconnecting from Twitch:', error);
      }
    }
  }

  // Check if connected to Twitch
  public isConnected(): boolean {
    return this.connected;
  }

  // Get connection status
  public getConnectionStatus(): { connected: boolean; channel: string } {
    return {
      connected: this.connected,
      channel: this.channelName
    };
  }
}
