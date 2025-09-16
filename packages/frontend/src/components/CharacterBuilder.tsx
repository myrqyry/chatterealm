import React, { useState, useEffect } from 'react';
import { PlayerClass, Stats } from 'shared';
import { CLASS_INFO, GAME_CONFIG } from 'shared';
import { MaterialCard, MaterialButton, MaterialDialog } from './index';
import SVGAvatarUpload from './SVGAvatarUpload';
// EmojiPicker removed per request: full svgmoji handling will be used via server
import { gsap } from 'gsap';
import { useRef } from 'react';
import Popover from '@mui/material/Popover';
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

  const [isAnimating, setIsAnimating] = useState(false);
  const [useHandDrawn, setUseHandDrawn] = useState(false);
  const [isConvertingEmoji, setIsConvertingEmoji] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [roughPreset, setRoughPreset] = useState<'sketch' | 'cartoon' | 'technical' | 'wild' | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  // Convert the selected emoji to a hand-drawn SVG when toggle is enabled
  useEffect(() => {
    let mounted = true;

    const convertClientRough = async (emoji: string) => {
      if (!useHandDrawn || emoji === 'custom') return;
      setIsConvertingEmoji(true);
      try {
        // dynamic import to avoid bundling issues
        const svgmoji = await import('@svgmoji/noto');
        const { Svg2Roughjs, OutputType } = await import('svg2roughjs');

        // try common access patterns
        let rawSvg: string | null = null;
        try {
          if (typeof (svgmoji as any).get === 'function') rawSvg = (svgmoji as any).get(emoji);
        } catch {}
        if (!rawSvg) {
          try { rawSvg = (svgmoji as any).toSvg?.(emoji); } catch {}
        }
        if (!rawSvg) {
          const def = (svgmoji as any).default || (svgmoji as any);
          const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
          const key = `u${codepoints.join('_')}`;
          rawSvg = def?.[key] || def?.[codepoints.join('_')];
        }

        if (!rawSvg) throw new Error('svgmoji did not provide SVG');

        if (!mounted) return;
        // convert rawSvg to rough using svg2roughjs in browser
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(rawSvg, 'image/svg+xml');
        const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;
        const container = document.createElement('div');
        const converter = new (Svg2Roughjs as any)(container, OutputType.SVG);
        converter.svg = svgElement;
        // apply simple preset mapping if a roughPreset exists
        if (roughPreset === 'sketch') converter.roughConfig.roughness = 1.2;
        if (roughPreset === 'cartoon') converter.roughConfig.roughness = 0.6;
        if (roughPreset === 'technical') converter.roughConfig.roughness = 0.2;
        if (roughPreset === 'wild') converter.roughConfig.roughness = 1.8;
        const result: any = await converter.sketch();
        let resultSvg = '';
        if (result && result instanceof SVGSVGElement) {
          resultSvg = new XMLSerializer().serializeToString(result);
        } else if (container.innerHTML) {
          resultSvg = container.innerHTML;
        }

        if (!mounted) return;
        setCustomAvatar({ original: rawSvg, rough: resultSvg || rawSvg });
        setSelectedAvatar('custom');
      } catch (err) {
        console.warn('Client-side hand-drawn conversion failed for emoji', emoji, err);
      } finally {
        if (mounted) setIsConvertingEmoji(false);
      }
    };

    // Run conversion when selectedAvatar changes and hand-drawn is enabled
    if (useHandDrawn && selectedAvatar && selectedAvatar !== 'custom') {
      convertClientRough(selectedAvatar);
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

// Emoji popover state handled inline below; no block-level picker to avoid expanding modal

  return (
    <MaterialDialog open={isOpen} onClose={onClose} title="Create Your Character" maxWidth="sm" fullWidth>
      <div className="character-builder p-4 max-w-[900px] w-full h-[95vh] flex flex-col justify-center">
        <div className="text-center mb-2">
          <h2 className="text-lg font-semibold text-white mb-1">⚔️ Create Character</h2>
        </div>

        {/* Centered preview (moderate size) */}
        <div className="mb-3">
          <MaterialCard sx={{ padding: '16px', borderRadius: 14, background: 'rgba(32,28,36,0.9)', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
            <div className="flex flex-col items-center gap-3">
              <div
                ref={avatarRef}
                className={`w-44 h-44 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/50 emoji-font transition-all duration-200 ${isAnimating ? 'scale-105' : ''}`}
              >
                {selectedAvatar === 'custom' && customAvatar ? (
                  <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: (useHandDrawn && customAvatar.rough) ? customAvatar.rough : customAvatar.original }} />
                ) : (
                  <span className="text-6xl leading-none">{selectedAvatar}</span>
                )}
              </div>

              <div className="text-center">
                <div className="text-base lg:text-lg font-semibold text-white">{displayName || 'Your Name'}</div>
                <div className="text-sm lg:text-sm text-gray-300">{selectedClassInfo.name}</div>
              </div>

              {/* Conversion status */}
              <div className="flex items-center gap-2 text-xs text-gray-300">
                {isConvertingEmoji ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white/60 animate-spin" />
                    <div>Converting preview…</div>
                  </div>
                ) : (
                  <div>{useHandDrawn ? 'Hand-drawn preview applied' : 'Standard preview'}</div>
                )}
              </div>
            </div>
          </MaterialCard>
        </div>

        {/* Name input */}
        <div className="mb-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Character name"
            className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-md text-gray-100 text-sm focus:outline-none focus:ring-0"
            maxLength={20}
          />
        </div>

        {/* Class selector: full-width, styled buttons */}
        <div className="mb-4">
          <div className="text-sm text-gray-300 mb-2">Class</div>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(PlayerClass).map((playerClass) => {
              const info = CLASS_INFO[playerClass];
              const active = selectedClass === playerClass;
              return (
                <button
                  key={playerClass}
                  onClick={() => { setSelectedClass(playerClass); handleClassSelect(playerClass); }}
                  className={`w-full py-3 rounded-lg flex flex-col items-center justify-center text-sm border transition-all ${active ? 'border-purple-400 bg-gradient-to-br from-purple-600/10 via-purple-500/6 to-transparent shadow-md' : 'border-gray-700 bg-gray-800/20 hover:border-purple-400/40'}`}
                >
                  <div className="text-2xl mb-1">{info.emoji}</div>
                  <div className="text-xs text-gray-200">{info.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Avatar selector row: quick emojis + upload modal trigger */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            {['😀','😎','🧙','🛡️','🐉','⚔️'].map((e) => (
              <button
                key={e}
                onClick={() => setSelectedAvatar(e)}
                className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl ${selectedAvatar === e ? 'bg-purple-500/30 border border-purple-400' : 'bg-gray-800/20 border border-gray-700'}`}
                aria-label={`Quick select ${e}`}
              >{e}</button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              <label className="text-sm text-gray-300">Hand-drawn</label>
              <input type="checkbox" checked={useHandDrawn} onChange={(e) => setUseHandDrawn(e.target.checked)} />
              <MaterialButton onClick={() => setShowUploadModal(true)} variant="outlined">Custom SVG</MaterialButton>
            </div>
          </div>
        </div>

        {/* Upload modal (replaces inline upload) */}
        {showUploadModal && (
          <MaterialDialog open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload SVG Avatar" maxWidth="xs" fullWidth>
            <div className="p-3">
              <SVGAvatarUpload onAvatarSelect={(orig, rough) => { handleCustomAvatarSelect(orig, rough); setShowUploadModal(false); }} />
            </div>
          </MaterialDialog>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <MaterialButton onClick={onClose} variant="outlined" sx={{ padding: '8px 12px' }}>Cancel</MaterialButton>
          <MaterialButton onClick={handleJoinGame} disabled={!displayName.trim()} variant="contained" sx={{ padding: '8px 12px' }}>Join</MaterialButton>
        </div>
      </div>
    </MaterialDialog>
  );
};

export default CharacterBuilder;