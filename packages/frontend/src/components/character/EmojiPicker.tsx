import React from 'react';
import { CharacterClass } from 'shared';

export const EmojiPicker: React.FC<{
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  categories: string[];
}> = ({ selectedEmoji, onEmojiSelect, categories }) => {
  const emojisByCategory = {
    people: ['👤', '🧙‍♂️', '🧙‍♀️', '👨‍💻', '👩‍💻', '🦾', '🤖', '👻', '🧛‍♂️', '🧛‍♀️', '🧞‍♂️', '🧞‍♀️'],
    animals: ['🐺', '🦅', '🐍', '🦂', '🕷️', '🦇', '🐉', '🦖', '🐙', '🦑', '👾', '🦠'],
    objects: ['⚔️', '🛡️', '🔮', '⚡', '🔥', '❄️', '☢️', '⚛️', '🔬', '💎', '🧬', '🎭'],
    symbols: ['💀', '☠️', '⚠️', '🔥', '💥', '✨', '🌟', '💫', '🔮', '🎯', '🎲', '♠️']
  };

  return (
    <div className="emoji-picker bg-gray-800 p-4 rounded-lg">
      {categories.map(category => (
        <div key={category} className="emoji-category mb-4">
          <h4 className="text-sm font-semibold mb-2 capitalize text-gray-400">{category}</h4>
          <div className="grid grid-cols-6 gap-2">
            {(emojisByCategory as any)[category]?.map((emoji: string) => (
              <button
                key={emoji}
                className={`emoji-option p-2 rounded text-2xl hover:bg-gray-700 transition-colors ${
                  selectedEmoji === emoji ? 'bg-blue-600' : ''
                }`}
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};