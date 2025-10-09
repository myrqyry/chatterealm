export enum UIMode {
  PLAY = 'play',
  SPECTATE = 'spectate',
  DEV = 'dev',
  STREAM_OVERLAY = 'stream_overlay'
}

export interface ModeCapabilities {
  canEditSettings: boolean;
  canSpawnPlayer: boolean;
  canUseDevTools: boolean;
  canModifyWorld: boolean;
  showDebugInfo: boolean;
  showStreamOverlay: boolean;
  allowChatCommands: boolean;
}

export const MODE_CAPABILITIES: Record<UIMode, ModeCapabilities> = {
  [UIMode.PLAY]: {
    canEditSettings: true,
    canSpawnPlayer: true,
    canUseDevTools: false,
    canModifyWorld: false,
    showDebugInfo: false,
    showStreamOverlay: false,
    allowChatCommands: true
  },
  [UIMode.SPECTATE]: {
    canEditSettings: false,
    canSpawnPlayer: false,
    canUseDevTools: false,
    canModifyWorld: false,
    showDebugInfo: false,
    showStreamOverlay: true,
    allowChatCommands: false
  },
  [UIMode.DEV]: {
    canEditSettings: true,
    canSpawnPlayer: true,
    canUseDevTools: true,
    canModifyWorld: true,
    showDebugInfo: true,
    showStreamOverlay: false,
    allowChatCommands: true
  },
  [UIMode.STREAM_OVERLAY]: {
    canEditSettings: false,
    canSpawnPlayer: false,
    canUseDevTools: false,
    canModifyWorld: false,
    showDebugInfo: false,
    showStreamOverlay: true,
    allowChatCommands: false
  }
};