import { Server } from 'socket.io';
import { GameStateManager } from './gameStateManager';
import { TwitchService, ChatCommand } from './twitchService';

export class StreamOptimizedTwitchService extends TwitchService {
  private commandQueue: ChatCommand[] = [];
  private processingBatch = false;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_INTERVAL = 2000; // Process every 2 seconds for stream pacing

  constructor(io: Server, clientId: string, clientSecret: string, channelName: string, gameStateManager: GameStateManager) {
    super(io, clientId, clientSecret, channelName, gameStateManager);

    // Process commands in batches to maintain stream watchability
    setInterval(() => this.processBatchedCommands(), this.BATCH_INTERVAL);
  }

  private async processBatchedCommands(): Promise<void> {
    if (this.processingBatch || this.commandQueue.length === 0) return;

    this.processingBatch = true;
    const batch = this.commandQueue.splice(0, this.BATCH_SIZE);

    // Group similar commands for dramatic effect
    const movements = batch.filter(cmd => ['up', 'down', 'left', 'right', 'move'].includes(cmd.command));
    const attacks = batch.filter(cmd => cmd.command === 'attack');
    const spawns = batch.filter(cmd => cmd.command === 'spawn');

    // Process movements as a wave
    if (movements.length > 0) {
      await this.processMovementWave(movements);
    }

    // Process attacks with combat commentary
    if (attacks.length > 0) {
      await this.processCombatWave(attacks);
    }

    // Process spawns with fanfare
    if (spawns.length > 0) {
      await this.processSpawnWave(spawns);
    }

    this.processingBatch = false;
  }

  private async processMovementWave(movements: ChatCommand[]): Promise<void> {
    const results = await Promise.all(
      movements.map(cmd => this.executeMovementCommand(cmd))
    );

    // Create engaging stream commentary
    const successful = results.filter(r => r.success).length;
    if (successful > 0) {
      this.sendStreamMessage(`🏃‍♂️ ${successful} players moved simultaneously across the wasteland!`);
    }
  }

  private async executeMovementCommand(cmd: ChatCommand): Promise<{ success: boolean; message?: string }> {
    const player = this.getExistingPlayer(cmd.username);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    let direction: 'up' | 'down' | 'left' | 'right' | undefined;

    if (cmd.command === 'move' && cmd.args.length > 0) {
        const arg = cmd.args[0].toLowerCase();
        if (['up', 'down', 'left', 'right'].includes(arg)) {
            direction = arg as 'up' | 'down' | 'left' | 'right';
        }
    } else if (['up', 'down', 'left', 'right'].includes(cmd.command)) {
        direction = cmd.command as 'up' | 'down' | 'left' | 'right';
    }

    if (!direction) {
        return { success: false, message: "Invalid movement command" };
    }

    const message = this.handleMovementCommand(cmd, direction);
    return { success: !message.includes("Cannot move there!") };
  }

  private async processCombatWave(attacks: ChatCommand[]): Promise<void> {
    for (const attack of attacks) {
      const handler = this.commandHandlers.get('attack');
      if (handler) {
        await handler.handler(attack);
      }
    }
  }

  private async processSpawnWave(spawns: ChatCommand[]): Promise<void> {
    for (const spawn of spawns) {
      const handler = this.commandHandlers.get('spawn');
      if (handler) {
        await handler.handler(spawn);
      }
    }
  }

  public async processChatMessage(twitchMessage: any): Promise<void> {
    if (!twitchMessage.message.startsWith('!')) {
      return;
    }

    const parts = twitchMessage.message.substring(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const chatCommand: ChatCommand = {
        command,
        args,
        username: twitchMessage.username,
        displayName: twitchMessage.displayName,
        userId: twitchMessage.username,
        channelPoints: twitchMessage.channelPoints || 0,
        timestamp: Date.now()
    };

    this.commandQueue.push(chatCommand);
  }

  public async sendStreamMessage(message: string): Promise<void> {
    // Override base method, return a promise
    await this.sendChatResponse(message);
  }
}