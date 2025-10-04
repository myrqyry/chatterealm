import React, { useState, useEffect } from 'react';
import { PlayerClass, Stats } from 'shared';
import { CLASS_INFO, GAME_CONFIG } from 'shared';
import { MaterialCard, MaterialButton, MaterialDialog } from './index';
import SVGAvatarUpload from './SVGAvatarUpload';
// EmojiPicker removed per request: full svgmoji handling will be used via server
import { gsap } from 'gsap';
import { useRef } from 'react';
import { assetConverter } from '../services/assetConverter';
import { COLORS } from '../utils/tokens';

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
  const [selectedClass, setSelectedClass] = useState<PlayerClass>(currentPlayer?.class || PlayerClass.KNIGHT);
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

  const [nameError, setNameError] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [useHandDrawn, setUseHandDrawn] = useState(false);
  const [isConvertingEmoji, setIsConvertingEmoji] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [roughPreset, setRoughPreset] = useState<'sketch' | 'cartoon' | 'technical' | 'wild' | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Validate name input
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return 'Character name is required';
    }
    if (name.length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.length > 20) {
      return 'Name must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      return 'Name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    return '';
  };

  // Handle name change with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setDisplayName(newName);
    const error = validateName(newName);
    setNameError(error);
  };

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
    gsap.to(previewRef.current, {
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

  // Convert emoji to hand-drawn SVG with improved error handling
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const convertClientRough = async (emoji: string) => {
      if (!useHandDrawn || emoji === 'custom') return;

      setIsConvertingEmoji(true);

      try {
        // Set a timeout for the conversion
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Emoji conversion timed out');
            setIsConvertingEmoji(false);
          }
        }, 10000); // 10 second timeout

        // Try to get SVG from svgmoji
        const svgmoji = await import('@svgmoji/noto');
        let rawSvg: string | null = null;

        // Try different access patterns for svgmoji
        try {
          if (typeof (svgmoji as any).get === 'function') {
            rawSvg = (svgmoji as any).get(emoji);
          }
        } catch {}

        if (!rawSvg) {
          try {
            rawSvg = (svgmoji as any).toSvg?.(emoji);
          } catch {}
        }

        if (!rawSvg) {
          const def = (svgmoji as any).default || (svgmoji as any);
          const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
          const key = `u${codepoints.join('_')}`;
          rawSvg = def?.[key] || def?.[codepoints.join('_')];
        }

        if (!rawSvg) {
          throw new Error('SVG not found for emoji');
        }

        if (!mounted) return;

        // Convert SVG to rough version
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(rawSvg, 'image/svg+xml');
        const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;

        if (!svgElement || svgElement.tagName !== 'svg') {
          throw new Error('Invalid SVG format');
        }

        const container = document.createElement('div');
        const { Svg2Roughjs, OutputType } = await import('svg2roughjs');
        const converter = new (Svg2Roughjs as any)(container, OutputType.SVG);

        converter.svg = svgElement;

        // Apply preset-based roughness
        if (roughPreset === 'sketch') converter.roughConfig.roughness = 1.2;
        else if (roughPreset === 'cartoon') converter.roughConfig.roughness = 0.6;
        else if (roughPreset === 'technical') converter.roughConfig.roughness = 0.2;
        else if (roughPreset === 'wild') converter.roughConfig.roughness = 1.8;
        else converter.roughConfig.roughness = 1.0; // default

        const result: any = await converter.sketch();
        let resultSvg = '';

        if (result && result instanceof SVGSVGElement) {
          resultSvg = new XMLSerializer().serializeToString(result);
        } else if (container.innerHTML) {
          resultSvg = container.innerHTML;
        }

        if (!mounted) return;

        if (resultSvg) {
          setCustomAvatar({ original: rawSvg, rough: resultSvg });
          setSelectedAvatar('custom');
        } else {
          throw new Error('Conversion failed to produce SVG');
        }

      } catch (err) {
        console.warn('Client-side hand-drawn conversion failed for emoji', emoji, err);
        // Fallback: use original emoji if conversion fails
        if (mounted) {
          setSelectedAvatar(emoji);
        }
      } finally {
        if (mounted) {
          setIsConvertingEmoji(false);
          clearTimeout(timeoutId);
        }
      }
    };

    // Run conversion when conditions change
    if (useHandDrawn && selectedAvatar && selectedAvatar !== 'custom') {
      convertClientRough(selectedAvatar);
    }

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [useHandDrawn, selectedAvatar, roughPreset]);

  // Re-fetch converted SVG when preset changes (if hand-drawn is active)
  useEffect(() => {
    if (!useHandDrawn) return;
    if (!selectedAvatar || selectedAvatar === 'custom') return;

    const reFetchWithPreset = async () => {
      setIsConvertingEmoji(true);
      try {
        const svg = await assetConverter.fetchEmojiSvg(selectedAvatar, 'svgmoji', {
          rough: true,
          preset: roughPreset || undefined
        });

        if (svg) {
          setCustomAvatar({ original: svg, rough: svg });
          setSelectedAvatar('custom');
        }
      } catch (err) {
        console.warn('Preset re-fetch failed', err);
        // Keep current avatar if re-fetch fails
      } finally {
        setIsConvertingEmoji(false);
      }
    };

    reFetchWithPreset();
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
    const nameValidationError = validateName(displayName);
    if (nameValidationError) {
      setNameError(nameValidationError);
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

// Emoji popover state handled inline below; no block-level picker to avoid expanding modal

  return (
    <MaterialDialog
      open={isOpen}
      onClose={onClose}
      title="Create Your Character"
      maxWidth="md"
      fullWidth
    >
      <div className="character-builder p-3 max-w-4xl w-full" style={{
        background: 'linear-gradient(135deg, rgba(32,28,36,0.95) 0%, rgba(42,38,46,0.95) 100%)',
        borderRadius: '16px'
      }}>
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold text-white mb-2">⚔️ Create Your Character</h2>
          <p className="text-gray-400 text-sm">Choose your class, customize your appearance, and join the adventure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Character Preview */}
          <div className="space-y-4">
            <MaterialCard sx={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(32,28,36,0.8)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
            }}>
              <div className="flex flex-col items-center gap-4">
                {/* Avatar Preview */}
                <div
                  ref={avatarRef}
                  className={`w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/50 emoji-font transition-all duration-200 ${isAnimating ? 'scale-105' : ''}`}
                >
                  {selectedAvatar === 'custom' && customAvatar ? (
                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: (useHandDrawn && customAvatar.rough) ? customAvatar.rough : customAvatar.original }} />
                  ) : (
                    <span className="text-5xl leading-none">{selectedAvatar}</span>
                  )}
                </div>

                {/* Character Info */}
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{displayName || 'Your Name'}</div>
                  <div className="text-sm text-purple-300">{selectedClassInfo.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{selectedClassInfo.description}</div>
                </div>

                {/* Conversion status */}
                {isConvertingEmoji && (
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-3 h-3 rounded-full border-2 border-white/60 animate-spin" />
                    <div>Converting preview…</div>
                  </div>
                )}
              </div>
            </MaterialCard>

            {/* Stats Preview */}
            <MaterialCard sx={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(32,28,36,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h3 className="text-sm font-semibold text-white mb-3">Base Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">HP:</span>
                  <span className="text-green-400">{selectedStats.hp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Attack:</span>
                  <span className="text-red-400">{selectedStats.attack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Defense:</span>
                  <span className="text-blue-400">{selectedStats.defense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Speed:</span>
                  <span className="text-yellow-400">{selectedStats.speed}</span>
                </div>
              </div>
            </MaterialCard>
          </div>

          {/* Right Column - Customization Options */}
          <div className="space-y-4">
            {/* Name Input */}
            <MaterialCard sx={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(32,28,36,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>Character Name</label>
              <input
                type="text"
                value={displayName}
                onChange={handleNameChange}
                placeholder="Enter your character name"
                className={`w-full px-4 py-3 border-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200 ${
                  nameError ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/30' : 'border-gray-600/60 hover:border-gray-500/60 focus:ring-purple-500/50 focus:border-purple-400'
                }`}
                style={{
                  backgroundColor: COLORS.backgroundMedium,
                  color: COLORS.text.primary,
                  borderColor: nameError ? COLORS.error : COLORS.borderGray
                }}
                maxLength={20}
              />
              <div className="flex justify-between items-center mt-1">
                <div className={`text-xs ${nameError ? 'text-red-400' : ''}`} style={{ color: nameError ? COLORS.error : COLORS.text.secondary }}>
                  {nameError || `${displayName.length}/20 characters`}
                </div>
                {nameError && (
                  <div className="text-xs text-red-400 flex items-center gap-1">
                    <span>⚠️</span>
                    Error
                  </div>
                )}
              </div>
            </MaterialCard>            {/* Class Selection */}
            <MaterialCard sx={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(32,28,36,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h3 className="text-sm font-semibold text-white mb-3">Choose Your Class</h3>
              <div className="grid grid-cols-1 gap-2">
                {(Object.values(PlayerClass) as PlayerClass[]).map((playerClass) => {
                  const info = CLASS_INFO[playerClass];
                  const active = selectedClass === playerClass;
                  return (
                    <button
                      key={playerClass as string}
                      onClick={() => { setSelectedClass(playerClass); handleClassSelect(playerClass); }}
                      className={`w-full p-4 rounded-lg flex items-center gap-3 text-left transition-all duration-200 border-2 ${
                        active
                          ? 'border-purple-400/60 bg-gradient-to-r from-purple-600/20 to-purple-500/10 shadow-lg'
                          : 'border-gray-600/60 bg-gray-800/40 hover:border-purple-400/40 hover:bg-purple-500/5'
                      }`}
                    >
                      <div className="text-2xl">{info.emoji}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{info.name}</div>
                        <div className="text-xs text-gray-400">{info.description}</div>
                      </div>
                      {active && <div className="text-purple-400">✓</div>}
                    </button>
                  );
                })}
              </div>
            </MaterialCard>

            {/* Avatar Selection */}
            <MaterialCard sx={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(32,28,36,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h3 className="text-sm font-semibold text-white mb-3">Choose Avatar</h3>

              {/* Quick Emojis */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">Quick Select</div>
                <div className="grid grid-cols-6 gap-2">
                  {['😀','😎','🧙','🛡️','🐉','⚔️','🦄','👑','🌟','🔥'].map((e) => (
                    <button
                      key={e}
                      onClick={() => setSelectedAvatar(e)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-200 border-2 ${
                        selectedAvatar === e
                          ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/60 scale-110 shadow-lg'
                          : 'bg-gray-800/60 border-gray-600/60 hover:border-purple-400/40 hover:bg-purple-500/5 hover:scale-105'
                      }`}
                      aria-label={`Select ${e}`}
                    >{e}</button>
                  ))}
                </div>
              </div>

              {/* Custom Emoji Input */}
              <div className="mb-4">
                <div className="text-xs mb-2" style={{ color: COLORS.text.secondary }}>Or Type Your Own Emoji</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedAvatar}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow single emoji or empty string
                      if (value.length <= 2) {
                        setSelectedAvatar(value);
                      }
                    }}
                    placeholder="Type emoji here..."
                    className="flex-1 px-4 py-3 border-2 border-gray-600/60 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 hover:border-gray-500/60 transition-all duration-200"
                    style={{
                      backgroundColor: COLORS.backgroundMedium,
                      color: COLORS.text.primary,
                      borderColor: COLORS.borderGray
                    }}
                    maxLength={2}
                  />
                  <div className="w-12 h-10 rounded-lg flex items-center justify-center text-xl border-2"
                       style={{
                         backgroundColor: COLORS.backgroundMedium,
                         borderColor: COLORS.borderGray
                       }}>
                    {selectedAvatar || '😀'}
                  </div>
                </div>
                <div className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                  Type or paste any emoji (max 1 character)
                </div>
              </div>

              {/* Hand-drawn Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Hand-drawn Style</label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="hand-drawn-toggle"
                      checked={useHandDrawn}
                      onChange={(e) => setUseHandDrawn(e.target.checked)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="hand-drawn-toggle"
                      className={`w-12 h-6 rounded-full cursor-pointer transition-all duration-200 ${
                        useHandDrawn
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                          : 'bg-gray-600/60 hover:bg-gray-500/60'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                          useHandDrawn ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </label>
                  </div>
                </div>

                {useHandDrawn && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Style Preset</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'sketch', label: 'Sketch', emoji: '✏️' },
                        { key: 'cartoon', label: 'Cartoon', emoji: '🎨' },
                        { key: 'technical', label: 'Technical', emoji: '📐' },
                        { key: 'wild', label: 'Wild', emoji: '🌪️' }
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() => setRoughPreset(preset.key as any)}
                          className={`p-3 rounded-lg text-xs font-medium transition-all duration-200 border-2 ${
                            roughPreset === preset.key
                              ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-400/60 text-purple-200 shadow-lg'
                              : 'bg-gray-800/40 border-gray-600/60 text-gray-300 hover:border-purple-400/40 hover:bg-purple-500/5'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{preset.emoji}</div>
                            <div className="text-white font-semibold">{preset.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-600">
                  <MaterialButton
                    onClick={() => setShowUploadModal(true)}
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(168,85,247,0.5)',
                        backgroundColor: 'rgba(168,85,247,0.1)'
                      }
                    }}
                  >
                    Upload Custom SVG
                  </MaterialButton>
                </div>
              </div>
            </MaterialCard>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-600">
          <MaterialButton
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.4)',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }
            }}
          >
            Cancel
          </MaterialButton>
          <MaterialButton
            onClick={handleJoinGame}
            disabled={!displayName.trim() || !!nameError}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
              },
              '&:disabled': {
                background: 'rgba(107,114,128,0.5)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            Join Adventure
          </MaterialButton>
        </div>
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <MaterialDialog
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Custom SVG Avatar"
          maxWidth="sm"
          fullWidth
        >
          <div className="p-4">
            <SVGAvatarUpload
              onAvatarSelect={(orig, rough) => {
                handleCustomAvatarSelect(orig, rough);
                setShowUploadModal(false);
              }}
            />
          </div>
        </MaterialDialog>
      )}
    </MaterialDialog>
  );
};

export default CharacterBuilder;