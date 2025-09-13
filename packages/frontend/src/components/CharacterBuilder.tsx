import React, { useState, useEffect } from 'react';
import { PlayerClass, Stats } from 'shared';
import { CLASS_INFO, GAME_CONFIG } from 'shared';
import { MaterialCard, MaterialButton, MaterialDialog, MaterialChip } from './index';
import SVGAvatarUpload from './SVGAvatarUpload';
import { gsap } from 'gsap';

interface CharacterBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinGame: (characterData: {
    displayName: string;
    class: PlayerClass;
    avatar: string;
  }) => void;
  currentPlayer?: {
    displayName: string;
    class: PlayerClass;
    avatar: string;
  } | null;
}

const AVATAR_OPTIONS = [
  '👤', '🧙‍♂️', '🧙‍♀️', '⚔️', '🗡️', '🏹', '🛡️', '👑', '🎭', '🦊', '🐺', '🐉',
  '🦄', '🧚‍♀️', '🧛‍♂️', '🧟‍♂️', '👻', '💀', '👽', '🤖', '🎃', '🦇', '🐺', '🦅'
];

const CharacterBuilder: React.FC<CharacterBuilderProps> = ({
  isOpen,
  onClose,
  onJoinGame,
  currentPlayer
}) => {
  const [selectedClass, setSelectedClass] = useState<PlayerClass>(
    currentPlayer?.class || PlayerClass.KNIGHT
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentPlayer?.avatar || '👤'
  );
  const [displayName, setDisplayName] = useState<string>(
    currentPlayer?.displayName || ''
  );
  const [customAvatar, setCustomAvatar] = useState<{
    original: string;
    rough: string;
  } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get stats for selected class
  const getClassStats = (playerClass: PlayerClass): Stats => {
    return GAME_CONFIG.baseStats[playerClass];
  };

  // Handle class selection with animation
  const handleClassSelect = (playerClass: PlayerClass) => {
    if (playerClass === selectedClass) return;

    setIsAnimating(true);
    gsap.to('.character-preview', {
      scale: 0.9,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        setSelectedClass(playerClass);
        setIsAnimating(false);
      }
    });
  };

  // Handle custom avatar selection
  const handleCustomAvatarSelect = (originalSvg: string, roughSvg: string) => {
    setCustomAvatar({ original: originalSvg, rough: roughSvg });
    setSelectedAvatar('custom');
  };

  // Handle joining game
  const handleJoinGame = () => {
    if (!displayName.trim()) {
      // Could add validation feedback here
      return;
    }

    onJoinGame({
      displayName: displayName.trim(),
      class: selectedClass,
      avatar: selectedAvatar === 'custom' && customAvatar ? customAvatar.rough : selectedAvatar
    });
  };

  const selectedClassInfo = CLASS_INFO[selectedClass];
  const selectedStats = getClassStats(selectedClass);

  return (
    <MaterialDialog
      open={isOpen}
      onClose={onClose}
      title="Create Your Character"
      maxWidth="md"
      fullWidth={true}
    >
      <div className="character-builder p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            ⚔️ Character Builder ⚔️
          </h2>
          <p className="text-gray-300">
            Choose your class, customize your appearance, and enter the realm!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Character Preview */}
          <div className="space-y-4">
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                  Character Preview
                </h3>

                {/* Character Display */}
                <div className="character-preview flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div
                      className="text-8xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full p-8 border-2 border-purple-400/50"
                      style={{
                        filter: isAnimating ? 'blur(2px)' : 'none',
                        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {selectedAvatar === 'custom' && customAvatar ? (
                        <div dangerouslySetInnerHTML={{ __html: customAvatar.rough }} />
                      ) : (
                        selectedAvatar
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full px-3 py-1 border border-purple-400/50">
                      <span className="text-sm font-medium text-white">
                        {selectedClassInfo.emoji}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-white">
                      {displayName || 'Enter Name'}
                    </h4>
                    <p className="text-lg text-purple-300 font-medium">
                      {selectedClassInfo.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedClassInfo.description}
                    </p>
                  </div>
                </div>

                {/* Stats Display */}
                <div className="mt-6 space-y-2">
                  <h4 className="text-lg font-semibold text-white text-center mb-3">Base Stats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-300">{selectedStats.hp}</div>
                      <div className="text-xs text-red-200">HP</div>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-300">{selectedStats.attack}</div>
                      <div className="text-xs text-orange-200">ATTACK</div>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-300">{selectedStats.defense}</div>
                      <div className="text-xs text-blue-200">DEFENSE</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-300">{selectedStats.speed}</div>
                      <div className="text-xs text-green-200">SPEED</div>
                    </div>
                  </div>
                </div>
              </div>
            </MaterialCard>
          </div>

          {/* Right Column - Customization Options */}
          <div className="space-y-4">
            {/* Name Input */}
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Character Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your character name..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={20}
                />
              </div>
            </MaterialCard>

            {/* Class Selection */}
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Choose Your Class</h4>
                <div className="space-y-3">
                  {Object.values(PlayerClass).map((playerClass) => {
                    const classInfo = CLASS_INFO[playerClass];
                    const isSelected = selectedClass === playerClass;

                    return (
                      <div
                        key={playerClass}
                        onClick={() => handleClassSelect(playerClass)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{classInfo.emoji}</span>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white">{classInfo.name}</h5>
                            <p className="text-sm text-gray-300">{classInfo.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {classInfo.abilities.map((ability) => (
                                <MaterialChip
                                  key={ability}
                                  label={ability}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(196, 167, 231, 0.2)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.7rem',
                                    height: '18px'
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </MaterialCard>

            {/* Avatar Selection */}
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Choose Your Avatar</h4>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all duration-200 ${
                        selectedAvatar === avatar
                          ? 'border-purple-400 bg-purple-500/20 scale-110'
                          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:scale-105'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>

                {/* Custom SVG Upload */}
                <div className="mt-4">
                  <SVGAvatarUpload
                    onAvatarSelect={handleCustomAvatarSelect}
                    currentAvatar={selectedAvatar === 'custom' && customAvatar ? customAvatar.rough : undefined}
                  />
                </div>
              </div>
            </MaterialCard>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <MaterialButton
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(196, 167, 231, 0.5)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                borderColor: 'rgba(196, 167, 231, 0.8)',
                backgroundColor: 'rgba(196, 167, 231, 0.1)'
              }
            }}
          >
            Cancel
          </MaterialButton>
          <MaterialButton
            onClick={handleJoinGame}
            disabled={!displayName.trim()}
            variant="contained"
            sx={{
              backgroundColor: 'rgba(196, 167, 231, 0.8)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(196, 167, 231, 1)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(196, 167, 231, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            Join the Realm! ⚔️
          </MaterialButton>
        </div>
      </div>
    </MaterialDialog>
  );
};

export default CharacterBuilder;