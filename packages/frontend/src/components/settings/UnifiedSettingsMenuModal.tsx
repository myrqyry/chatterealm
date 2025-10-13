import React, { useState, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { MaterialButton, MaterialPopover, MaterialCard } from './index';
import CategoryButton from './shared/CategoryButton';
import {
  Info as InfoIcon,
  VideogameAsset as GameIcon,
  VolumeUp as AudioIcon,
  Visibility as VisualIcon,
  Public as WorldIcon,
  SportsEsports as ActionsIcon,
} from '@mui/icons-material';

import { MaterialMultiSelect } from './shared/settings';

// Import individual modal components
import OverviewModal from './settings/OverviewModal';
import GameplayModal from './settings/GameplayModal';
import AudioModal from './settings/AudioModal';
import VisualModal from './settings/VisualModal';
import WorldModal from './settings/WorldModal';
import ActionsModal from './settings/ActionsModal';

/**
 * UnifiedSettingsMenuModal
 * A modal-based settings menu that opens full-height popovers for each category.
 * This replaces the tabbed interface with a more spacious modal experience.
 */
const UnifiedSettingsMenuModal: React.FC = () => {
  const {
    unifiedSettings,
    updateGameSettings,
    updateAudioSettings,
    updateNotificationSettings,
    updateVisualSettings,
    updateWorldSettings,
    updateAnimationSettings,
    gameWorld,
    currentPlayer,
    joinGame,
    movePlayer,
    startCataclysm,
    pickupItem,
    regenerateWorld,
    gameMessage,
  } = useGameStore();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const exportSettings = useGameStore(s => s.exportSettings);
  const importSettings = useGameStore(s => s.importSettings);
  const resetAllSettings = useGameStore(s => s.resetAllSettings);

  // Import / Export handlers
  const handleExport = () => {
    const data = exportSettings();
    navigator.clipboard.writeText(data);
    alert('Settings exported to clipboard!');
  };

  const handleImport = () => {
    if (importText.trim()) {
      const success = importSettings(importText.trim());
      if (success) {
        alert('Settings imported successfully!');
        setImportText('');
        setShowImportExport(false);
      } else {
        alert('Import failed. Check JSON format.');
      }
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset ALL settings to defaults?')) {
      resetAllSettings();
      alert('All settings reset.');
    }
  };

  const notificationTypeOptions = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'sound', label: 'Sound' },
    { value: 'ingame', label: 'In-Game' },
  ];

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const categories = [
    { id: 'overview', label: 'Overview', icon: InfoIcon, token: 'primary' },
    { id: 'gameplay', label: 'Gameplay', icon: GameIcon, token: 'health.healthy' },
    { id: 'audio', label: 'Audio', icon: AudioIcon, token: 'accentPurple' },
    { id: 'visual', label: 'Visual', icon: VisualIcon, token: 'accentDarkPurple' },
    { id: 'world', label: 'World', icon: WorldIcon, token: 'secondary' },
    { id: 'actions', label: 'Actions', icon: ActionsIcon, token: 'error' },
  ];

  return (
    <div className="h-full flex flex-col font-inter">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-divider">
        <h3 className="text-text-primary text-sm font-semibold m-0">⚙️ Settings</h3>
        <div className="flex gap-2">
          <MaterialButton size="small" onClick={() => setShowImportExport(v => !v)} sx={{ minHeight: '32px', px: 2, fontSize: '0.8rem' }}>{showImportExport ? 'Hide' : 'I/E'}</MaterialButton>
          <MaterialButton size="small" color="error" onClick={handleResetAll} sx={{ minHeight: '32px', px: 2, fontSize: '0.8rem' }}>Reset</MaterialButton>
        </div>
      </div>

      {/* Import/Export Panel */}
      {showImportExport && (
        <MaterialCard sx={{ mb: 2, p: 2, backgroundColor: 'var(--color-surface-variant)' }}>
          <div className="mb-3">
            <MaterialButton onClick={handleExport} sx={{ mr: 1 }}>📤 Export Settings</MaterialButton>
          </div>
          <div className="mb-2">
            <label className="block font-mono text-sm text-text-primary mb-1">Import Settings JSON</label>
            <textarea
              className="w-full min-h-[80px] p-2 bg-background-paper border border-divider rounded text-text-primary font-mono text-sm resize-y"
              placeholder="Paste exported JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <MaterialButton onClick={handleImport}>📥 Import</MaterialButton>
        </MaterialCard>
      )}

  {/* Notifications panel (quick access in modal) */}
  <MaterialCard sx={{ mb: 2, p: 2, backgroundColor: 'var(--color-surface-variant)' }}>
        <h3 className="m-0 mb-2">🔔 Notifications</h3>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary text-on-primary border border-primary rounded text-sm font-medium transition-colors hover:bg-primary-container" onClick={() => updateNotificationSettings({ desktopNotifications: !unifiedSettings.notifications.desktopNotifications })}>Toggle Desktop</button>
            <button className="px-3 py-1.5 bg-primary text-on-primary border border-primary rounded text-sm font-medium transition-colors hover:bg-primary-container" onClick={() => updateNotificationSettings({ soundNotifications: !unifiedSettings.notifications.soundNotifications })}>Toggle Sound</button>
          </div>
          <div>
            <MaterialMultiSelect label="Player Join Notifications" value={unifiedSettings.notifications.playerJoinNotifications} options={notificationTypeOptions} onChange={(vals) => updateNotificationSettings({ playerJoinNotifications: vals as any })} />
            <MaterialMultiSelect label="Cataclysm Notifications" value={unifiedSettings.notifications.cataclysmNotifications} options={notificationTypeOptions} onChange={(vals) => updateNotificationSettings({ cataclysmNotifications: vals as any })} />
          </div>
        </div>
      </MaterialCard>

      {/* Category Buttons - Compact Single Row */}
      <div className="flex gap-1.5 mb-4 justify-center flex-wrap">
        {categories.map(category => {
          const IconComponent = category.icon;
          return (
            <CategoryButton
              key={category.id}
              id={category.id}
              Icon={IconComponent}
              onClick={() => openModal(category.id)}
              buttonRef={(el) => buttonRefs.current[category.id] = el}
              colorToken={category.token}
            />
          );
        })}
      </div>

      {/* Overview Modal */}
      <MaterialPopover
        open={activeModal === 'overview'}
        onClose={closeModal}
        anchorEl={buttonRefs.current.overview}
        fullHeight={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <OverviewModal onClose={closeModal} />
      </MaterialPopover>

      {/* Gameplay Modal */}
      <MaterialPopover
        open={activeModal === 'gameplay'}
        onClose={closeModal}
        anchorEl={buttonRefs.current.gameplay}
        fullHeight={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <GameplayModal onClose={closeModal} />
      </MaterialPopover>

      {/* Audio Modal */}
      <MaterialPopover
        open={activeModal === 'audio'}
        onClose={closeModal}
        anchorEl={buttonRefs.current.audio}
        fullHeight={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <AudioModal onClose={closeModal} />
      </MaterialPopover>

      {/* Visual Modal */}
      <MaterialPopover
        open={activeModal === 'visual'}
        onClose={closeModal}
        anchorEl={buttonRefs.current.visual}
        fullHeight={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <VisualModal onClose={closeModal} />
      </MaterialPopover>

      {/* World Modal */}
      <MaterialPopover
        open={activeModal === 'world'}
        onClose={closeModal}
        anchorEl={buttonRefs.current.world}
        fullHeight={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <WorldModal onClose={closeModal} />
      </MaterialPopover>

      {/* Actions Modal */}
      <MaterialPopover
        open={activeModal === 'actions'}
        onClose={closeModal}
        anchorEl={buttonRefs.current.actions}
        fullHeight={true}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <ActionsModal onClose={closeModal} />
      </MaterialPopover>
    </div>
  );
};

export default UnifiedSettingsMenuModal;
