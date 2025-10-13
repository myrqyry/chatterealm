import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CharacterClass, CharacterVisual } from 'shared';
import { EmojiCharacterService } from '../../services/EmojiCharacterService';
import { useCharacterClasses } from '../../hooks/useCharacterClasses';
import { useGameStore } from '../../stores/gameStore';
import { EmojiPicker } from './EmojiPicker';
import { ClassCard } from './ClassCard';
import { CharacterStats } from './CharacterStats';
import { ClassBackgroundEffects } from './ClassEffects';

export const CharacterCreator: React.FC = () => {
  const [selectedEmoji, setSelectedEmoji] = useState('🧙‍♂️');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [characterPreview, setCharacterPreview] = useState<CharacterVisual | null>(null);
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
  const [characterName, setCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emojiService] = useState(() => new EmojiCharacterService());
  const { characterClasses } = useCharacterClasses();
  const { handleCreateCharacter } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    let animationInterval: NodeJS.Timeout;

    const generateCharacterPreview = async () => {
      if (!selectedClass) return;

      setIsLoading(true);
      setError(null);
      try {
        const preview = await emojiService.createCharacterFromEmoji(selectedEmoji, selectedClass);
        setCharacterPreview(preview);

        animationInterval = setInterval(() => {
          setCurrentAnimationFrame(prev => (prev + 1) % (preview.animationFrames.length || 1));
        }, preview.animationSpeed);
      } catch (e) {
        console.error("Error generating character preview:", e);
        setError("Could not generate character preview.");
      } finally {
        setIsLoading(false);
      }
    };

    generateCharacterPreview();

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [selectedEmoji, selectedClass]);

  const createCharacter = async () => {
    if (!selectedClass || !characterPreview || !characterName.trim()) {
      setError("Please select a class, and enter a name.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const characterData = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: characterName.trim(),
      emoji: selectedEmoji,
      characterClass: selectedClass,
      visual: characterPreview,
      stats: { ...selectedClass.baseStats },
      level: 1,
      experience: 0,
      resources: {
        [selectedClass.primaryResource]: 100
      },
      abilities: selectedClass.abilities.filter(ability => ability.unlockLevel <= 1),
      inventory: [],
      equipment: {},
      position: { x: 0, y: 0 },
      isAlive: true,
      spawnTime: Date.now(),
      lastActive: Date.now()
    };

    try {
      await handleCreateCharacter(characterData);
      navigate('/play');
    } catch (err) {
      console.error('Failed to create character:', err);
      setError('Failed to create character. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="character-creator bg-gray-900 p-6 rounded-lg max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="preview-section">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Character Preview</h2>

          <div className="preview-container bg-black p-8 rounded-lg relative h-64 flex items-center justify-center">
            {isLoading && <div className="text-white">Loading Preview...</div>}
            {error && !isLoading && <div className="text-red-500">{error}</div>}
            {characterPreview && !isLoading && (
              <div
                className="character-preview-avatar scale-150"
                dangerouslySetInnerHTML={{
                  __html: characterPreview.animationFrames[currentAnimationFrame] || ''
                }}
              />
            )}

            {selectedClass && (
              <div className="class-effects absolute inset-0 pointer-events-none">
                <ClassBackgroundEffects characterClass={selectedClass} />
              </div>
            )}
          </div>

          {selectedClass && (
            <CharacterStats characterClass={selectedClass} />
          )}
        </div>

        <div className="creation-controls">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Create Your Survivor</h2>

          <div className="emoji-selection mb-6">
            <h3 className="text-lg font-semibold mb-3">Choose Your Avatar</h3>
            <EmojiPicker
              selectedEmoji={selectedEmoji}
              onEmojiSelect={setSelectedEmoji}
              categories={['people', 'animals', 'objects', 'symbols']}
            />
          </div>

          <div className="class-selection">
            <h3 className="text-lg font-semibold mb-3">Select Your Path</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {characterClasses.map(charClass => (
                <ClassCard
                  key={charClass.id}
                  characterClass={charClass}
                  isSelected={selectedClass?.id === charClass.id}
                  onSelect={() => setSelectedClass(charClass)}
                />
              ))}
            </div>
          </div>

          <div className="character-name mt-6">
            <h3 className="text-lg font-semibold mb-3">Survivor Name</h3>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Enter your wasteland name..."
              maxLength={20}
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </div>

          <button
            className="create-character-btn mt-6 w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-500"
            disabled={!selectedClass || !characterName.trim() || isLoading}
            onClick={createCharacter}
          >
            {isLoading ? 'Entering Wasteland...' : 'Enter the Wasteland'}
          </button>
        </div>
      </div>
    </div>
  );
};