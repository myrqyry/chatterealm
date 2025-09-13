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
  // Fantasy Characters
  '🧙‍♂️', '🧙‍♀️', '🧚‍♂️', '�‍♀️', '🧛‍♂️', '🧛‍♀️', '🧟‍♂️', '🧟‍♀️', '🧞‍♂️', '🧞‍♀️', '🧜‍♂️', '🧜‍♀️',
  '🧝‍♂️', '🧝‍♀️', '🧌', '🐉', '🦄', '🦕', '🦖', '🐺', '🦊', '🦁', '🐯', '🐅', '🐆', '🐴', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄',
  '🐷', '🐗', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐹', '🐰', '🐿️', '🦔', '🦇', '🐻', '🐨',
  '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉',
  '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖',

  // Warriors & Knights
  '⚔️', '🗡️', '🔪', '🏹', '🛡️', '👑', '�️', '🏅', '�', '🥈', '🥉', '👤', '🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🦹‍♀️', '🕵️‍♂️', '🕵️‍♀️',
  '👮‍♂️', '👮‍♀️', '👷‍♂️', '👷‍♀️', '💂‍♂️', '💂‍♀️', '🕵️‍♂️', '🕵️‍♀️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓',
  '👩‍🎤', '👨‍🎤', '👩‍🎨', '👨‍🎨', '👩‍🚀', '👨‍🚀', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬', '👩‍💻', '👨‍💻', '�‍🎤', '�‍🎤',

  // Mythical & Magical
  '🧙‍♂️', '🧙‍♀️', '�‍♂️', '🧚‍♀️', '🧛‍♂️', '🧛‍♀️', '🧟‍♂️', '🧟‍♀️', '🧞‍♂️', '🧞‍♀️', '🧜‍♂️', '🧜‍♀️', '🧝‍♂️', '🧝‍♀️', '🧌', '🐉',
  '🦄', '🦕', '🦖', '🐺', '🦊', '🦁', '🐯', '🐅', '🐆', '🐴', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐗', '🐏', '🐑',
  '🐐', '�', '�', '🦙', '🦒', '�', '🦏', '�', '🐭', '🐹', '🐰', '🐿️', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨',
  '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '�️', '🦅', '🦆', '🦢', '🦉', '🦚', '🦜', '🐸', '🐊',
  '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖',

  // Objects & Symbols
  '⚔️', '🗡️', '🔪', '🏹', '🛡️', '👑', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪',
  '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭',
  '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨',
  '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪',
  '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭',
  '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨',

  // Nature & Elements
  '🌟', '⭐', '🌙', '☀️', '🌈', '☁️', '🌊', '🔥', '❄️', '⚡', '🌪️', '🌫️', '🌬️', '🌡️', '💧', '💎', '🔮', '🪄', '⚱️',
  '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛽', '🏪', '🏫', '🏢', '🏬', '🏭', '🏣', '🏤', '🏥', '🏦',
  '🏨', '🏩', '💒', '⛪', '🕌', '🕍', '⛩️', '🕋', '⛓️', '🧰', '🧲', '🧪', '🧫', '🧬', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼',
  '🧽', '🧯', '🛒', '🚬', '⚰️', '🪦', '⚱️', '🗿', '🪨', '🪵', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬',
  '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏛️', '⛪', '🕌', '🕍', '⛩️', '🕋', '⛲', '⛽', '🚧', '🚦', '🚥', '🚨',

  // More Fantasy & Adventure
  '🗝️', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🛡️', '🏹', '🎣', '🧶', '🧵', '🪡', '🧥', '👚', '👕', '👖', '🧣', '🧤',
  '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👛', '👜', '👝', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰',
  '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '📿', '💄', '💍', '💎', '🔮', '🪄', '⚱️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️',
  '🎡', '🎢', '🎠', '⛲', '⛽', '🏪', '🏫', '🏢', '🏬', '🏭', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '💒', '⛪', '🕌', '🕍',
  '⛩️', '🕋', '⛓️', '🧰', '🧲', '🧪', '🧫', '🧬', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🛒', '🚬', '⚰️', '🪦'
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
  const [avatarSearch, setAvatarSearch] = useState('');
  const [customAvatar, setCustomAvatar] = useState<{
    original: string;
    rough: string;
  } | null>(null);

  // Filter avatars based on search - show suggested if empty, search results if not
  const filteredAvatars = avatarSearch === '' 
    ? AVATAR_OPTIONS.slice(0, 24) // Show first 24 as suggested
    : AVATAR_OPTIONS.filter(avatar => avatar.includes(avatarSearch.toLowerCase())).slice(0, 48);
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
      maxWidth="lg"
      fullWidth={true}
    >
      <div className="character-builder p-4 lg:p-6">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 lg:mb-3">
            ⚔️ Character Builder ⚔️
          </h2>
          <p className="text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Choose your class, customize your appearance, and enter the realm!
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Character Preview */}
          <div className="space-y-4">
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-4 lg:p-6">
                <h3 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 text-center">
                  Character Preview
                </h3>

                {/* Character Display */}
                <div className="character-preview flex flex-col items-center space-y-4 lg:space-y-6">
                  <div className="relative">
                    <div
                      className="text-9xl lg:text-[12rem] bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full p-8 lg:p-10 border-3 lg:border-4 border-purple-400/50 emoji-font"
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
                    <div className="absolute -bottom-2 lg:-bottom-3 -right-2 lg:-right-3 bg-gray-800 rounded-full px-3 lg:px-4 py-1 lg:py-2 border-2 lg:border-3 border-purple-400/50">
                      <span className="text-base lg:text-lg font-medium text-white">
                        {selectedClassInfo.emoji}
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-1 lg:space-y-2">
                    <h4 className="text-2xl lg:text-3xl font-bold text-white">
                      {displayName || 'Enter Name'}
                    </h4>
                    <p className="text-lg lg:text-xl text-purple-300 font-medium">
                      {selectedClassInfo.name}
                    </p>
                    <p className="text-sm lg:text-base text-gray-400 mt-1 lg:mt-2 max-w-md mx-auto leading-relaxed">
                      {selectedClassInfo.description}
                    </p>
                  </div>
                </div>

                {/* Stats Display */}
                <div className="mt-6 lg:mt-8 space-y-3 lg:space-y-4">
                  <h4 className="text-lg lg:text-xl font-semibold text-white text-center mb-3 lg:mb-4">Base Stats</h4>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="bg-red-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-red-500/30">
                      <div className="text-2xl lg:text-3xl font-bold text-red-300 mb-1">{selectedStats.hp}</div>
                      <div className="text-xs lg:text-sm text-red-200 font-medium">HP</div>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-orange-500/30">
                      <div className="text-2xl lg:text-3xl font-bold text-orange-300 mb-1">{selectedStats.attack}</div>
                      <div className="text-xs lg:text-sm text-orange-200 font-medium">ATTACK</div>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-blue-500/30">
                      <div className="text-2xl lg:text-3xl font-bold text-blue-300 mb-1">{selectedStats.defense}</div>
                      <div className="text-xs lg:text-sm text-blue-200 font-medium">DEFENSE</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 text-center border border-green-500/30">
                      <div className="text-2xl lg:text-3xl font-bold text-green-300 mb-1">{selectedStats.speed}</div>
                      <div className="text-xs lg:text-sm text-green-200 font-medium">SPEED</div>
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
              <div className="p-4 lg:p-6">
                <label className="block text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">
                  Character Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your character name..."
                  className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-700/50 border-2 border-purple-400/30 rounded-lg lg:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base lg:text-lg font-medium"
                  maxLength={20}
                />
                <p className="text-sm text-gray-400 mt-2 lg:mt-3">
                  Choose a name that represents your heroic journey! ⚔️
                </p>
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
              <div className="p-4 lg:p-6">
                <h4 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 text-center">Choose Your Class</h4>
                <div className="space-y-3 lg:space-y-4">
                  {Object.values(PlayerClass).map((playerClass) => {
                    const classInfo = CLASS_INFO[playerClass];
                    const isSelected = selectedClass === playerClass;

                    return (
                      <div
                        key={playerClass}
                        onClick={() => handleClassSelect(playerClass)}
                        className={`p-4 lg:p-5 rounded-lg lg:rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                            : 'border-gray-600 bg-gray-700/30 hover:border-purple-400/50 hover:bg-purple-500/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3 lg:space-x-4">
                          <span className="text-3xl lg:text-4xl">{classInfo.emoji}</span>
                          <div className="flex-1">
                            <h5 className="text-lg lg:text-xl font-bold text-white mb-1">{classInfo.name}</h5>
                            <p className="text-sm lg:text-base text-gray-300 mb-2 lg:mb-3 leading-relaxed">{classInfo.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {classInfo.abilities.map((ability) => (
                                <MaterialChip
                                  key={ability}
                                  label={ability}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(196, 167, 231, 0.2)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.75rem',
                                    height: '20px',
                                    padding: '0 6px'
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
              <div className="p-4 lg:p-6">
                <h4 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 text-center">Choose Your Avatar</h4>

                {/* Search Input */}
                <div className="mb-4 lg:mb-6">
                  <input
                    type="text"
                    value={avatarSearch}
                    onChange={(e) => setAvatarSearch(e.target.value)}
                    placeholder={avatarSearch === '' ? "Search emojis or browse suggestions..." : "Search emojis..."}
                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-700/50 border border-purple-400/30 rounded-lg lg:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base lg:text-lg"
                  />
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-6 lg:grid-cols-8 gap-2 lg:gap-3 max-h-64 lg:max-h-80 overflow-y-auto">
                  {filteredAvatars.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`aspect-square rounded-lg lg:rounded-xl border-2 transition-all duration-200 hover:scale-105 emoji-font ${
                        selectedAvatar === avatar
                          ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30 scale-110'
                          : 'border-gray-600 bg-gray-700/30 hover:border-purple-400/50 hover:bg-purple-500/10'
                      }`}
                      style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' // Responsive emoji sizing
                      }}
                      title={avatar}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>

                {filteredAvatars.length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-gray-400 text-sm lg:text-base">
                    No emojis found matching your search
                  </div>
                )}

                {/* Custom SVG Upload */}
                <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-600/50">
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
        <div className="flex justify-end space-x-4 lg:space-x-6 mt-6 lg:mt-8">
          <MaterialButton
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(196, 167, 231, 0.5)',
              color: 'var(--color-text-primary)',
              fontSize: '1rem',
              padding: '10px 20px',
              borderRadius: '8px',
              '&:hover': {
                borderColor: 'rgba(196, 167, 231, 0.8)',
                backgroundColor: 'rgba(196, 167, 231, 0.1)',
                transform: 'scale(1.05)'
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
              fontSize: '1.1rem',
              fontWeight: 'bold',
              padding: '12px 28px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(196, 167, 231, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(196, 167, 231, 1)',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 25px rgba(196, 167, 231, 0.4)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(196, 167, 231, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
                transform: 'none'
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