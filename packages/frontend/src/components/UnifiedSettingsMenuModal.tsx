import React, { useState, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { MaterialButton, MaterialPopover, MaterialCard } from './index';
import {
  Info as InfoIcon,
  VideogameAsset as GameIcon,
  VolumeUp as AudioIcon,
  Visibility as VisualIcon,
  Public as WorldIcon,
  SportsEsports as ActionsIcon,
} from '@mui/icons-material';

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

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const categories = [
    {
      id: 'overview',
      label: 'Overview',
      icon: InfoIcon,
      color: '#2196f3', // Blue
      hoverColor: '#1976d2'
    },
    {
      id: 'gameplay',
      label: 'Gameplay',
      icon: GameIcon,
      color: '#4caf50', // Green
      hoverColor: '#388e3c'
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: AudioIcon,
      color: '#ff9800', // Orange
      hoverColor: '#f57c00'
    },
    {
      id: 'visual',
      label: 'Visual',
      icon: VisualIcon,
      color: '#9c27b0', // Purple
      hoverColor: '#7b1fa2'
    },
    {
      id: 'world',
      label: 'World',
      icon: WorldIcon,
      color: '#00bcd4', // Cyan
      hoverColor: '#0097a7'
    },
    {
      id: 'actions',
      label: 'Actions',
      icon: ActionsIcon,
      color: '#f44336', // Red
      hoverColor: '#d32f2f'
    },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--color-divider)'
      }}>
        <h3 style={{
          color: 'var(--color-text-primary)',
          fontSize: '1em',
          fontWeight: '600',
          margin: 0
        }}>
          ⚙️ Settings
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <MaterialButton
            size="small"
            onClick={() => setShowImportExport(v => !v)}
            sx={{
              minHeight: '32px',
              px: 2,
              fontSize: '0.8rem'
            }}
          >
            {showImportExport ? 'Hide' : 'I/E'}
          </MaterialButton>
          <MaterialButton
            size="small"
            color="error"
            onClick={handleResetAll}
            sx={{
              minHeight: '32px',
              px: 2,
              fontSize: '0.8rem'
            }}
          >
            Reset
          </MaterialButton>
        </div>
      </div>

      {/* Import/Export Panel */}
      {showImportExport && (
        <MaterialCard sx={{ mb: 2, p: 2 }}>
          <div style={{ marginBottom: '12px' }}>
            <MaterialButton
              onClick={handleExport}
              sx={{ mr: 1 }}
            >
              📤 Export Settings
            </MaterialButton>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.9rem',
              color: 'var(--color-text-primary)',
              marginBottom: '4px'
            }}>
              Import Settings JSON
            </label>
            <textarea
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                backgroundColor: 'var(--color-background-paper)',
                border: '1px solid var(--color-divider)',
                borderRadius: '4px',
                color: 'var(--color-text-primary)',
                fontFamily: 'JetBrains Mono',
                fontSize: '0.8rem',
                resize: 'vertical'
              }}
              placeholder="Paste exported JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <MaterialButton onClick={handleImport}>
            📥 Import
          </MaterialButton>
        </MaterialCard>
      )}

      {/* Category Buttons - Compact Single Row */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {categories.map(category => {
          const IconComponent = category.icon;
          return (
            <MaterialButton
              key={category.id}
              ref={(el) => buttonRefs.current[category.id] = el}
              onClick={() => openModal(category.id)}
              sx={{
                minWidth: '60px',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                borderRadius: 2,
                backgroundColor: `${category.color}20`, // 20 = 12.5% opacity
                border: `1px solid ${category.color}40`, // 40 = 25% opacity
                color: 'var(--color-text-primary)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: `${category.color}30`, // 30 = 18.75% opacity
                  borderColor: category.hoverColor,
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: `0 4px 12px ${category.color}30` // 30 = 18.75% opacity
                }
              }}
            >
              <IconComponent sx={{ fontSize: '2.2rem' }} />
            </MaterialButton>
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
