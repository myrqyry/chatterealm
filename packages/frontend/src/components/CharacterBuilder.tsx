import React, { useState, useEffect } from 'react';
import { PlayerClass, Stats } from 'shared';
import { CLASS_INFO, GAME_CONFIG } from 'shared';
import { MaterialCard, MaterialButton, MaterialDialog, MaterialChip } from './index';
import SVGAvatarUpload from './SVGAvatarUpload';
import EmojiPicker from './EmojiPicker';
import { gsap } from 'gsap';
import { useRef } from 'react';
import { assetConverter } from '../services/assetConverter';

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
  const [useHandDrawn, setUseHandDrawn] = useState(false);
  const [isConvertingEmoji, setIsConvertingEmoji] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [roughPreset, setRoughPreset] = useState<'sketch' | 'cartoon' | 'technical' | 'wild' | null>(null);
  const [showFullPicker, setShowFullPicker] = useState(false);

  // Persist hand-drawn preference and preset in localStorage
  useEffect(() => {
    try {
      const storedHand = localStorage.getItem('chatterealm:handdrawn');
      const storedPreset = localStorage.getItem('chatterealm:handdrawn:preset');
      if (storedHand !== null) setUseHandDrawn(storedHand === 'true');
      if (storedPreset) setRoughPreset(storedPreset as any);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chatterealm:handdrawn', String(useHandDrawn));
    } catch (e) {}
  }, [useHandDrawn]);

  useEffect(() => {
    try {
      if (roughPreset) localStorage.setItem('chatterealm:handdrawn:preset', roughPreset);
      else localStorage.removeItem('chatterealm:handdrawn:preset');
    } catch (e) {}
  }, [roughPreset]);

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

  // Convert the selected emoji to a hand-drawn SVG when toggle is enabled
  useEffect(() => {
    let mounted = true;

    const fetchServerRough = async (emoji: string) => {
      if (!useHandDrawn || emoji === 'custom') return;

      try {
        setIsConvertingEmoji(true);
        // Ask the backend to return a rough-converted SVG directly (use selected preset if present)
        const svg = await assetConverter.fetchEmojiSvg(emoji, 'svgmoji', { rough: true, preset: roughPreset || undefined });
        if (!mounted) return;
        setCustomAvatar({ original: svg, rough: svg });
        setSelectedAvatar('custom');
      } catch (err) {
        console.warn('Server-side hand-drawn fetch failed for emoji', emoji, err);
      } finally {
        if (mounted) setIsConvertingEmoji(false);
      }
    };

    // Run conversion when selectedAvatar changes and hand-drawn is enabled
    if (useHandDrawn && selectedAvatar && selectedAvatar !== 'custom') {
      fetchServerRough(selectedAvatar);
    }

    return () => { mounted = false; };
  }, [useHandDrawn, selectedAvatar]);

  // Re-fetch converted SVG when preset changes (if hand-drawn is active)
  useEffect(() => {
    if (!useHandDrawn) return;
    if (!selectedAvatar || selectedAvatar === 'custom') return;
    // trigger fetch with new preset
    (async () => {
      setIsConvertingEmoji(true);
      try {
        const svg = await assetConverter.fetchEmojiSvg(selectedAvatar, 'svgmoji', { rough: true, preset: roughPreset || undefined });
        setCustomAvatar({ original: svg, rough: svg });
        setSelectedAvatar('custom');
      } catch (err) {
        console.warn('Preset re-fetch failed', err);
      } finally {
        setIsConvertingEmoji(false);
      }
    })();
  }, [roughPreset]);

  // Animate avatar swaps
  useEffect(() => {
    const el = avatarRef.current;
    if (!el) return;

    const tl = gsap.timeline();
    tl.to(el, { duration: 0.18, scale: 0.85, rotation: -6, opacity: 0.4, ease: 'power2.in' });
    tl.to(el, { duration: 0.45, scale: 1, rotation: 0, opacity: 1, ease: 'elastic.out(1, 0.6)' });

    return () => { tl.kill(); };
  }, [selectedAvatar, customAvatar]);

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

// Small single-row quick emoji picker for compact UI
const QuickEmojiRow: React.FC<{ onSelect: (emoji: string) => void; selected?: string | null }> = ({ onSelect, selected }) => {
  const quick = ['😀','😎','🧙','🛡️','🐉','⚔️','🪄','🏹','🧭','👾','🤖','🐱','🐶','👤'];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 items-center px-1">
        {quick.map((e) => (
          <button
            key={e}
            onClick={() => onSelect(e)}
            className={`min-w-[40px] h-10 rounded-lg flex items-center justify-center text-lg transition-colors duration-150 ${selected === e ? 'bg-purple-500/30 border border-purple-400' : 'bg-gray-800/20 border border-gray-700'}`}
            aria-label={`Select ${e}`}
          >
            <span className="leading-none">{e}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

  return (
    <MaterialDialog
      open={isOpen}
      onClose={onClose}
      title="Create Your Character"
      maxWidth="sm"
      fullWidth={false}
    >
      <div className="character-builder p-2 md:p-3 max-w-[900px]">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
            ⚔️ Character Builder ⚔️
          </h2>
          <p className="text-sm lg:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
            Choose your class, customize your appearance, and enter the realm!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {/* Left Column - Character Preview */}
          <div className="space-y-4">
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-3 lg:p-4">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-2 text-center">Character Preview</h3>

                {/* Compact horizontal layout: stats left, preview center, stats right */}
                <div className="flex items-center justify-between space-x-3">
                  {/* Left stats (HP, ATTACK) */}
                  <div className="grid grid-rows-2 gap-2 w-24">
                    <div className="bg-red-500/20 rounded-lg p-2 text-center border border-red-500/30">
                      <div className="text-lg font-bold text-red-300">{selectedStats.hp}</div>
                      <div className="text-xs text-red-200 font-medium">HP</div>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg p-2 text-center border border-orange-500/30">
                      <div className="text-lg font-bold text-orange-300">{selectedStats.attack}</div>
                      <div className="text-xs text-orange-200 font-medium">ATK</div>
                    </div>
                  </div>

                  {/* Avatar preview */}
                  <div className="relative flex-1 flex items-center justify-center px-2">
                    <div
                      ref={avatarRef}
                      className={`w-24 sm:w-28 md:w-32 lg:w-36 h-24 sm:h-28 md:h-32 lg:h-36 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border-2 border-purple-400/50 emoji-font transition-all duration-300 ${isAnimating ? 'blur-sm scale-105' : 'scale-100'}`}
                    >
                      {selectedAvatar === 'custom' && customAvatar ? (
                        <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: customAvatar.rough }} />
                      ) : (
                        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none">{selectedAvatar}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full px-2 py-1 border border-purple-400/50">
                      <span className="text-sm font-medium text-white">{selectedClassInfo.emoji}</span>
                    </div>
                  </div>

                  {/* Right stats (DEF, SPEED) */}
                  <div className="grid grid-rows-2 gap-2 w-24">
                    <div className="bg-blue-500/20 rounded-lg p-2 text-center border border-blue-500/30">
                      <div className="text-lg font-bold text-blue-300">{selectedStats.defense}</div>
                      <div className="text-xs text-blue-200 font-medium">DEF</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-2 text-center border border-green-500/30">
                      <div className="text-lg font-bold text-green-300">{selectedStats.speed}</div>
                      <div className="text-xs text-green-200 font-medium">SPD</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <h4 className="text-base font-bold text-white">{displayName || 'Enter Name'}</h4>
                  <p className="text-sm text-purple-300">{selectedClassInfo.name}</p>
                </div>
              </div>
            </MaterialCard>
          </div>

          {/* Right Column - Customization Options */}
          <div className="space-y-2">
            {/* Name Input */}
            <MaterialCard
              sx={{
                background: 'rgba(49, 46, 56, 0.8)',
                border: '1px solid rgba(196, 167, 231, 0.2)',
                borderRadius: '12px'
              }}
            >
              <div className="p-3 lg:p-4">
                <label className="block text-base lg:text-lg font-semibold text-white mb-2 lg:mb-3">
                  Character Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your character name..."
                  className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700/50 border-2 border-purple-400/30 rounded-lg lg:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base font-medium"
                  maxLength={20}
                />
                <p className="text-xs text-gray-400 mt-1 lg:mt-2">
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
              <div className="p-3 lg:p-4">
                <h4 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 text-center">Choose Your Class</h4>
                <div className="space-y-2 lg:space-y-3">
                  {Object.values(PlayerClass).map((playerClass) => {
                    const classInfo = CLASS_INFO[playerClass];
                    const isSelected = selectedClass === playerClass;

                    return (
                      <div
                        key={playerClass}
                        onClick={() => handleClassSelect(playerClass)}
                        className={`p-3 lg:p-4 rounded-lg lg:rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                            : 'border-gray-600 bg-gray-700/30 hover:border-purple-400/50 hover:bg-purple-500/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3 lg:space-x-4">
                          <span className="text-2xl lg:text-3xl">{classInfo.emoji}</span>
                          <div className="flex-1">
                            <h5 className="text-base lg:text-lg font-bold text-white mb-1">{classInfo.name}</h5>
                            <p className="text-xs lg:text-sm text-gray-300 mb-1 lg:mb-2 leading-relaxed">{classInfo.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {classInfo.abilities.map((ability) => (
                                <MaterialChip
                                  key={ability}
                                  label={ability}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(196, 167, 231, 0.2)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.7rem',
                                    height: '18px',
                                    padding: '0 4px'
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
              <div className="p-3 lg:p-4">
                <h4 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 text-center">Choose Your Avatar</h4>

                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">Choose an emoji avatar</div>
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input type="checkbox" checked={useHandDrawn} onChange={(e) => setUseHandDrawn(e.target.checked)} />
                    <span>Hand-drawn</span>
                    {isConvertingEmoji && <span className="ml-2 text-xs text-yellow-300">🔄</span>}
                  </label>
                </div>

                {/* Rough presets */}
                <div className="mb-2 flex gap-2 flex-wrap">
                  {(['sketch','cartoon','technical','wild'] as const).map(p => (
                    <MaterialChip
                      key={p}
                      label={p}
                      size="small"
                      onClick={() => setRoughPreset(prev => prev === p ? null : p)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: roughPreset === p ? 'rgba(196,167,231,0.4)' : 'rgba(255,255,255,0.03)'
                      }}
                    />
                  ))}
                </div>

                {/* Quick single-row random / common emojis */}
                <QuickEmojiRow onSelect={(e) => setSelectedAvatar(e)} selected={selectedAvatar} />

                {/* Optional expanded picker */}
                <div className="mt-2 text-right">
                  <MaterialButton
                    onClick={() => setShowFullPicker(prev => !prev)}
                    variant="outlined"
                    sx={{ padding: '6px 10px', fontSize: '0.85rem' }}
                  >
                    {showFullPicker ? 'Hide' : 'More...'}
                  </MaterialButton>
                </div>

                {showFullPicker && (
                  <div className="mt-2">
                    <EmojiPicker onEmojiSelect={(e) => setSelectedAvatar(e)} selectedEmoji={selectedAvatar} compact={true} />
                  </div>
                )}

                {/* Custom SVG Upload */}
                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-600/50">
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
        <div className="flex justify-end space-x-3 lg:space-x-4 mt-4 lg:mt-6">
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