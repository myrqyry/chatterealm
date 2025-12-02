import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatWindow from './ChatWindow';
import { renderWithProviders } from '@/test/utils';

describe('ChatWindow Component', () => {
  const mockMessages = [
    {
      id: '1',
      message: 'Hello world!',
      username: 'user1',
      timestamp: Date.now(),
      isSystem: false,
    },
    {
      id: '2',
      message: 'Welcome to the game!',
      username: 'system',
      timestamp: Date.now(),
      isSystem: true,
    },
  ];

  const mockPlayers = [
    {
      id: 'player1',
      displayName: 'Hero1',
      avatar: '🧙',
      stats: { hp: 100, maxHp: 100, attack: 20, defense: 10 },
      position: { x: 5, y: 5 },
    },
    {
      id: 'player2',
      displayName: 'Hero2',
      avatar: '👑',
      stats: { hp: 80, maxHp: 100, attack: 15, defense: 15 },
      position: { x: 10, y: 10 },
    },
  ];

  const defaultProps = {
    messages: mockMessages,
    inputMessage: '',
    setInputMessage: vi.fn(),
    handleKeyPress: vi.fn(),
    sendChatCommand: vi.fn(),
    isConnected: true,
    username: 'testuser',
    displayName: 'Test User',
    channelPoints: 100,
    setChannelPoints: vi.fn(),
    players: mockPlayers,
    presetCommands: ['!help', '!spawn', '!attack'],
    setInputMessageAndFocus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Structure', () => {
    it('should render the chat window with proper title', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('🎮 Chat Grid Chronicles - Chat Test Interface')).toBeInTheDocument();
      expect(screen.getByText('Status: 🟢 Connected')).toBeInTheDocument();
    });

    it('should render all user interface sections', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('👤 User Settings')).toBeInTheDocument();
      expect(screen.getByText('🎭 Active Players (2)')).toBeInTheDocument();
      expect(screen.getByText('⚡ Quick Commands')).toBeInTheDocument();
      expect(screen.getByText('📖 How to Use')).toBeInTheDocument();
    });
  });

  describe('Connection Status', () => {
    it('should show connected status when isConnected is true', () => {
      renderWithProviders(<ChatWindow {...defaultProps} isConnected={true} />);
      expect(screen.getByText('Status: 🟢 Connected')).toBeInTheDocument();
    });

    it('should show disconnected status when isConnected is false', () => {
      renderWithProviders(<ChatWindow {...defaultProps} isConnected={false} />);
      expect(screen.getByText('Status: 🔴 Disconnected')).toBeInTheDocument();
    });
  });

  describe('User Settings Section', () => {
    it('should render user input fields with correct values', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      const displayNameInput = screen.getByPlaceholderText('Display Name');
      const channelPointsInput = screen.getByPlaceholderText('Channel Points');

      expect(usernameInput).toHaveValue('testuser');
      expect(displayNameInput).toHaveValue('Test User');
      expect(channelPointsInput).toHaveValue('100');
    });

    it('should call setInputMessage when username changes', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });

      expect(defaultProps.setInputMessage).toHaveBeenCalledWith('testusernewuser');
    });

    it('should call setInputMessage when display name changes', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const displayNameInput = screen.getByPlaceholderText('Display Name');
      fireEvent.change(displayNameInput, { target: { value: 'New Display' } });

      expect(defaultProps.setInputMessage).toHaveBeenCalledWith('New Display');
    });

    it('should call setChannelPoints when channel points change', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const channelPointsInput = screen.getByPlaceholderText('Channel Points');
      fireEvent.change(channelPointsInput, { target: { value: '200' } });

      expect(defaultProps.setChannelPoints).toHaveBeenCalledWith(200);
    });
  });

  describe('Players List Section', () => {
    it('should render all players with their stats', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('🧙')).toBeInTheDocument();
      expect(screen.getByText('Hero1')).toBeInTheDocument();
      expect(screen.getByText('HP: 100/100 | ATK: 20 | DEF: 10 | Pos: (5, 5)')).toBeInTheDocument();

      expect(screen.getByText('👑')).toBeInTheDocument();
      expect(screen.getByText('Hero2')).toBeInTheDocument();
      expect(screen.getByText('HP: 80/100 | ATK: 15 | DEF: 15 | Pos: (10, 10)')).toBeInTheDocument();
    });

    it('should show "No players in game" when players array is empty', () => {
      renderWithProviders(<ChatWindow {...defaultProps} players={[]} />);
      expect(screen.getByText('No players in game')).toBeInTheDocument();
    });
  });

  describe('Message List', () => {
    it('should render all messages', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('Hello world!')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the game!')).toBeInTheDocument();
    });
  });

  describe('Preset Commands', () => {
    it('should render all preset command buttons', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('!help')).toBeInTheDocument();
      expect(screen.getByText('!spawn')).toBeInTheDocument();
      expect(screen.getByText('!attack')).toBeInTheDocument();
    });

    it('should call setInputMessageAndFocus when a preset command is clicked', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const helpButton = screen.getByText('!help');
      fireEvent.click(helpButton);

      expect(defaultProps.setInputMessageAndFocus).toHaveBeenCalledWith('!help');
    });
  });

  describe('Help Section', () => {
    it('should render help information', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      expect(screen.getByText('Change your username and display name above')).toBeInTheDocument();
      expect(screen.getByText('Type commands starting with ! (like !help)')).toBeInTheDocument();
      expect(screen.getByText('Try !spawn knight to join the game!')).toBeInTheDocument();
    });
  });

  describe('Message Input Handling', () => {
    it('should call handleKeyPress when typing in message input', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const messageInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.keyPress(messageInput, { key: 'Enter', charCode: 13 });

      expect(defaultProps.handleKeyPress).toHaveBeenCalled();
    });

    it('should call sendChatCommand when send button is clicked', () => {
      renderWithProviders(<ChatWindow {...defaultProps} />);

      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      expect(defaultProps.sendChatCommand).toHaveBeenCalled();
    });
  });
});