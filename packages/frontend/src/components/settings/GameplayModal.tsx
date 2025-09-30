import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SettingCheckbox, SettingDropdown } from '../shared/settings';
import { DropdownOption } from '../shared/settings/SettingDropdown';
import { MovementStyle } from 'shared';
import { MaterialCard } from '../index';

const GameplayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { unifiedSettings, updateGameSettings } = useGameStore();

  const movementStyleOptions: DropdownOption[] = [
    { value: MovementStyle.GRID, label: 'Grid Movement' },
    { value: MovementStyle.FREE, label: 'Free Movement' },
    { value: MovementStyle.HYBRID, label: 'Hybrid Movement' },
  ];

  return (
    <div className="p-6 h-full overflow-auto jetbrains bg-gradient-to-br from-gray-900/95 to-gray-800/90">
      {/* Modal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <span className="text-2xl">🎮</span>
          </div>
          <div>
            <h1 className="m-0 text-text-primary text-2xl font-bold shadow-lg shadow-black/30">
              Gameplay
            </h1>
            <p className="mt-1 m-0 text-text-secondary text-sm font-normal">
              Core game mechanics and preferences
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="min-w-[40px] w-10 h-10 rounded-full bg-white/10 border-none text-text-primary cursor-pointer flex items-center justify-center text-xl transition-all duration-200 ease-out hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(76, 175, 80, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(76, 175, 80, 0.15)',
              borderColor: 'rgba(76, 175, 80, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Core Gameplay
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingCheckbox
              label="Enable Auto-Save"
              checked={unifiedSettings.game.autoSaveEnabled}
              onChange={(c) => updateGameSettings({ autoSaveEnabled: c })}
              description="Automatically save progress periodically"
            />
            <SettingCheckbox
              label="Show Tutorials"
              checked={unifiedSettings.game.tutorialEnabled}
              onChange={(c) => updateGameSettings({ tutorialEnabled: c })}
              description="Display tutorial hints"
            />
            <SettingCheckbox
              label="Show Mini-map"
              checked={unifiedSettings.game.minimapEnabled}
              onChange={(c) => updateGameSettings({ minimapEnabled: c })}
              description="Toggle mini-map display"
            />
            <SettingDropdown
              label="Movement Style"
              value={unifiedSettings.game.movementStyle}
              options={movementStyleOptions}
              onChange={(v) => updateGameSettings({ movementStyle: v as MovementStyle })}
              description="How the player traverses the world"
            />
          </div>
        </MaterialCard>

        <MaterialCard
          sx={{
            backgroundColor: 'rgba(25, 23, 36, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(244, 67, 54, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(244, 67, 54, 0.15)',
              borderColor: 'rgba(244, 67, 54, 0.3)'
            }
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-lg">⚔️</span>
            </div>
            <h3 className="m-0 text-text-primary text-lg font-semibold">
              Combat System
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <SettingCheckbox
              label="Show Damage Numbers"
              checked={unifiedSettings.game.showDamageNumbers}
              onChange={(c) => updateGameSettings({ showDamageNumbers: c })}
              description="Visual floating damage indicators"
            />
            <SettingCheckbox
              label="Enable Auto-Combat"
              checked={unifiedSettings.game.autoCombatEnabled}
              onChange={(c) => updateGameSettings({ autoCombatEnabled: c })}
              description="Auto retaliate when attacked"
            />
          </div>
        </MaterialCard>
      </div>
    </div>
  );
};

export default GameplayModal;
