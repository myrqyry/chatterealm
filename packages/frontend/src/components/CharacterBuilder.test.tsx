import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterBuilder from './CharacterBuilder';
import { renderWithProviders } from '@/test/utils';
import { PlayerClass } from 'shared';
import { CLASS_INFO } from 'shared';

describe('CharacterBuilder Component', () => {
  const mockOnClose = vi.fn();
  const mockOnJoinGame = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onJoinGame: mockOnJoinGame,
    currentPlayer: {
      displayName: 'TestPlayer',
      class: PlayerClass.KNIGHT,
      avatar: '👤',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  describe('Initial Rendering', () => {
    it('should render the character builder dialog when isOpen is true', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);
      expect(screen.getByText('⚔️ Create Your Character')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      const { container } = renderWithProviders(<CharacterBuilder {...defaultProps} isOpen={false} />);
      expect(container.querySelector('.character-builder')).not.toBeInTheDocument();
    });
  });

  describe('Name Input', () => {
    it('should display current player name in input', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);
      const nameInput = screen.getByPlaceholderText('Enter your character name');
      expect(nameInput).toHaveValue('TestPlayer');
    });

    it('should validate name length correctly', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} currentPlayer={{ ...defaultProps.currentPlayer, displayName: '' }} />);

      const nameInput = screen.getByPlaceholderText('Enter your character name');
      fireEvent.change(nameInput, { target: { value: 'A' } });
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { value: 'ValidName' } });
      expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
    });

    it('should show character count correctly', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} currentPlayer={{ ...defaultProps.currentPlayer, displayName: '' }} />);

      const nameInput = screen.getByPlaceholderText('Enter your character name');
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      expect(screen.getByText('4/20 characters')).toBeInTheDocument();
    });
  });

  describe('Class Selection', () => {
    it('should render all available player classes', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      Object.values(PlayerClass).forEach((playerClass) => {
        const info = CLASS_INFO[playerClass];
        expect(screen.getByText(info.name)).toBeInTheDocument();
      });
    });

    it('should highlight the selected class', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const knightClass = screen.getByText(CLASS_INFO[PlayerClass.KNIGHT].name);
      expect(knightClass.closest('button')).toHaveClass('border-purple-400/60');
    });

    it('should allow class selection', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const mageButton = screen.getByText(CLASS_INFO[PlayerClass.MAGE].name);
      fireEvent.click(mageButton);

      const updatedMageButton = screen.getByText(CLASS_INFO[PlayerClass.MAGE].name);
      expect(updatedMageButton.closest('button')).toHaveClass('border-purple-400/60');
    });
  });

  describe('Avatar Selection', () => {
    it('should display the current avatar', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should allow selecting quick emoji avatars', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const smileyButton = screen.getByLabelText('Select 😀');
      fireEvent.click(smileyButton);

      expect(screen.getByText('😀')).toBeInTheDocument();
    });

    it('should allow typing custom emoji', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const emojiInput = screen.getByPlaceholderText('Type emoji here...');
      fireEvent.change(emojiInput, { target: { value: '👑' } });

      expect(screen.getByText('👑')).toBeInTheDocument();
    });
  });

  describe('Hand-drawn Toggle', () => {
    it('should toggle hand-drawn mode', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const toggle = screen.getByLabelText('Hand-drawn Style');
      fireEvent.click(toggle);

      expect(toggle).toBeChecked();
    });

    it('should show preset options when hand-drawn is enabled', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const toggle = screen.getByLabelText('Hand-drawn Style');
      fireEvent.click(toggle);

      expect(screen.getByText('Sketch')).toBeInTheDocument();
      expect(screen.getByText('Cartoon')).toBeInTheDocument();
      expect(screen.getByText('Technical')).toBeInTheDocument();
      expect(screen.getByText('Wild')).toBeInTheDocument();
    });
  });

  describe('Class Stats Display', () => {
    it('should display correct stats for selected class', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const knightStats = CLASS_INFO[PlayerClass.KNIGHT];
      expect(screen.getByText(knightStats.name)).toBeInTheDocument();
      expect(screen.getByText(knightStats.description)).toBeInTheDocument();
    });

    it('should update stats when class changes', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const mageButton = screen.getByText(CLASS_INFO[PlayerClass.MAGE].name);
      fireEvent.click(mageButton);

      const mageStats = CLASS_INFO[PlayerClass.MAGE];
      expect(screen.getByText(mageStats.description)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable join button when name is empty', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} currentPlayer={{ ...defaultProps.currentPlayer, displayName: '' }} />);

      const joinButton = screen.getByText('Join Adventure');
      expect(joinButton).toBeDisabled();
    });

    it('should disable join button when name has validation error', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText('Enter your character name');
      fireEvent.change(nameInput, { target: { value: 'A' } });

      const joinButton = screen.getByText('Join Adventure');
      expect(joinButton).toBeDisabled();
    });

    it('should enable join button when name is valid', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const joinButton = screen.getByText('Join Adventure');
      expect(joinButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call onJoinGame when form is submitted', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const joinButton = screen.getByText('Join Adventure');
      fireEvent.click(joinButton);

      expect(mockOnJoinGame).toHaveBeenCalledWith({
        displayName: 'TestPlayer',
        class: PlayerClass.KNIGHT,
        avatar: '👤',
      });
    });

    it('should call onClose when cancel is clicked', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Local Storage Integration', () => {
    it('should persist hand-drawn preference to localStorage', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const toggle = screen.getByLabelText('Hand-drawn Style');
      fireEvent.click(toggle);

      expect(window.localStorage.getItem('chatterealm:handdrawn')).toBe('true');
    });

    it('should persist rough preset to localStorage when selected', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const toggle = screen.getByLabelText('Hand-drawn Style');
      fireEvent.click(toggle);

      const sketchButton = screen.getByText('Sketch');
      fireEvent.click(sketchButton);

      expect(window.localStorage.getItem('chatterealm:handdrawn:preset')).toBe('sketch');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid emoji input gracefully', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const emojiInput = screen.getByPlaceholderText('Type emoji here...');
      fireEvent.change(emojiInput, { target: { value: 'invalid-emoji' } });

      // Should not crash and maintain current avatar
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should show error for invalid character names', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} currentPlayer={{ ...defaultProps.currentPlayer, displayName: '' }} />);

      const nameInput = screen.getByPlaceholderText('Enter your character name');
      fireEvent.change(nameInput, { target: { value: 'Invalid@Name!' } });

      expect(screen.getByText('Name can only contain letters, numbers, spaces, hyphens, and underscores')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing currentPlayer gracefully', () => {
      expect(() => {
        renderWithProviders(<CharacterBuilder
          isOpen={true}
          onClose={mockOnClose}
          onJoinGame={mockOnJoinGame}
          currentPlayer={null}
        />);
      }).not.toThrow();
    });

    it('should handle empty avatar selection', () => {
      renderWithProviders(<CharacterBuilder {...defaultProps} />);

      const emojiInput = screen.getByPlaceholderText('Type emoji here...');
      fireEvent.change(emojiInput, { target: { value: '' } });

      // Should fall back to default avatar
      expect(screen.getByText('👤')).toBeInTheDocument();
    });
  });
});