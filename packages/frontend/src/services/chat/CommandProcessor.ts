class CommandProcessor {
  public isCommand(message: string): boolean {
    return message.startsWith('!');
  }

  public getPresetCommands(): string[] {
    return [
      '!help',
      '!spawn knight',
      '!spawn rogue',
      '!spawn mage',
      '!move up',
      '!move down',
      '!move left',
      '!move right',
      '!status'
    ];
  }

  // Future command parsing and execution logic could go here.
  // For now, it simply identifies commands and provides preset ones.
}

export const commandProcessor = new CommandProcessor();