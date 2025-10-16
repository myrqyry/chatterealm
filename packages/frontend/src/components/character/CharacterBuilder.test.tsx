import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterBuilder from '../CharacterBuilder';
import { PlayerClass } from 'shared';
import { vi } from 'vitest';

// Mock the is-unicode-supported library
vi.mock('is-unicode-supported', () => ({
  __esModule: true,
  default: (str: string) => {
    // For testing purposes, we'll consider any non-empty string as a valid emoji
    return str.length > 0;
  },
}));

describe('CharacterBuilder', () => {
  const onJoinGame = vi.fn();
  const onClose = vi.fn();

  it('should allow entering a complex emoji', () => {
    render(
      <CharacterBuilder
        isOpen={true}
        onClose={onClose}
        onJoinGame={onJoinGame}
      />
    );

    const emojiInput = screen.getByPlaceholderText('Type emoji here...');
    const complexEmoji = '👮🏾‍♂️'; // This emoji has a length of 7

    fireEvent.change(emojiInput, { target: { value: complexEmoji } });

    expect(emojiInput).toHaveValue(complexEmoji);
  });
});