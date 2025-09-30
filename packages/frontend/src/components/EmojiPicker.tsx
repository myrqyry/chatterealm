import React, { useState, useMemo } from 'react';
import { MaterialCard, MaterialButton, MaterialDialog } from './index';

interface EmojiPickerProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  className?: string;
  compact?: boolean;
}

const EMOJI_CATEGORIES = {
  fantasy: {
    name: 'Fantasy',
    emojis: [
      '🧙‍♂️', '🧙‍♀️', '🧚‍♂️', '🧚‍♀️', '🧛‍♂️', '🧛‍♀️', '🧟‍♂️', '🧟‍♀️', '🧞‍♂️', '🧞‍♀️',
      '🧜‍♂️', '🧜‍♀️', '🧝‍♂️', '🧝‍♀️', '🧌', '🐉', '🦄', '🐺', '🦊', '🦁', '🐯', '🦓',
      '🦌', '🐘', '🦏', '🦛', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾'
    ]
  },
  warriors: {
    name: 'Warriors',
    emojis: [
      '⚔️', '🗡️', '🔪', '🏹', '🛡️', '👑', '🏅', '🥇', '🥈', '🥉', '🦸‍♂️', '🦸‍♀️', '🦹‍♂️', '🦹‍♀️',
      '👮‍♂️', '👮‍♀️', '💂‍♂️', '💂‍♀️', '🕵️‍♂️', '🕵️‍♀️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾',
      '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🎨', '👨‍🎨', '👩‍🚀', '👨‍🚀'
    ]
  },
  animals: {
    name: 'Animals',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽',
      '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅',
      '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️'
    ]
  },
  nature: {
    name: 'Nature',
    emojis: [
      '🌟', '⭐', '🌙', '☀️', '🌈', '☁️', '🌊', '🔥', '❄️', '⚡', '🌪️', '🌫️', '🌬️',
      '🌡️', '💧', '🌱', '🌿', '☘️', '🍀', '🎋', '🎍', '🌾', '🌵', '🎄', '🌲', '🌳',
      '🌴', '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌻', '🌺', '🌸', '🌷', '🌹'
    ]
  },
  objects: {
    name: 'Objects',
    emojis: [
      '💎', '🔮', '🪄', '⚱️', '🗿', '🏰', '🏯', '🎡', '🎢', '🎠', '⛲', '🏪', '🏫',
      '🏢', '🏬', '🏭', '🏥', '🏦', '🏨', '💒', '⛪', '🕌', '🕍', '⛩️', '🕋', '🗝️',
      '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '🏹', '🎣', '🧶', '🧵', '🪡', '🧥', '👚', '👕',
      '👖', '🧣', '🧤', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👛', '👜'
    ]
  },
  food: {
    name: 'Food',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍',
      '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒',
      '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
      '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙'
    ]
  },
  activities: {
    name: 'Activities',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
      '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
      '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♂️', '🏋️‍♀️', '🤸‍♂️',
      '🤸‍♀️', '⛹️‍♂️', '⛹️‍♀️', '🏌️‍♂️', '🏌️‍♀️', '🏇', '🧘‍♂️', '🧘‍♀️', '🏃‍♂️', '🏃‍♀️'
    ]
  }
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  selectedEmoji,
  onEmojiSelect,
  className = '',
  compact = false
}) => {
  const [activeCategory, setActiveCategory] = useState('fantasy');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!searchQuery) {
      return EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES]?.emojis || [];
    }

    // Search across all categories
    const allEmojis: Array<{ emoji: string; category: string }> = [];
    Object.entries(EMOJI_CATEGORIES).forEach(([categoryKey, category]) => {
      category.emojis.forEach(emoji => {
        allEmojis.push({ emoji, category: categoryKey });
      });
    });

    return allEmojis
      .filter(({ emoji }) =>
        emoji.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(({ emoji }) => emoji);
  }, [activeCategory, searchQuery]);

  return (
  <div className={`${compact ? 'space-y-2' : 'space-y-4'} ${className}`}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emojis..."
          className={`w-full px-3 ${compact ? 'py-2' : 'py-3'} bg-gray-700/50 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className={`${compact ? 'flex gap-1' : 'flex flex-wrap gap-2'}`}>
          {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === key
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50'
                  : 'bg-gray-700/30 text-gray-300 border border-gray-600 hover:bg-purple-500/10 hover:border-purple-400/30'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className={`${compact ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
        <div className={`${compact ? 'grid grid-cols-10 gap-1' : 'grid grid-cols-8 gap-2'}`}>
          {filteredEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onEmojiSelect(emoji)}
              className={`aspect-square rounded-md border-2 transition-all duration-150 hover:scale-105 emoji-font ${compact ? 'text-lg p-1' : 'text-2xl'} ${
                selectedEmoji === emoji
                  ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                  : 'border-gray-600 bg-gray-700/30 hover:border-purple-400/50 hover:bg-purple-500/10'
              }`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;