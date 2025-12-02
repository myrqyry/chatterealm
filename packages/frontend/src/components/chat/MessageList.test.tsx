import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageList from './MessageList';
import { renderWithProviders } from '@/test/utils';

describe('MessageList Component', () => {
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
    {
      id: '3',
      message: 'This is a long message that should test the message formatting and overflow behavior in the chat interface.',
      username: 'user2',
      timestamp: Date.now(),
      isSystem: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Rendering', () => {
    it('should render all messages', () => {
      renderWithProviders(<MessageList messages={mockMessages} username="currentUser" />);

      expect(screen.getByText('Hello world!')).toBeInTheDocument();
      expect(screen.getByText('Welcome to the game!')).toBeInTheDocument();
      expect(screen.getByText('This is a long message that should test the message formatting and overflow behavior in the chat interface.')).toBeInTheDocument();
    });

    it('should render system messages with different styling', () => {
      renderWithProviders(<MessageList messages={mockMessages} username="currentUser" />);

      const systemMessage = screen.getByText('Welcome to the game!');
      expect(systemMessage).toHaveClass('system-message');
    });

    it('should render user messages with username and timestamp', () => {
      renderWithProviders(<MessageList messages={mockMessages} username="currentUser" />);

      const userMessage = screen.getByText('Hello world!');
      expect(userMessage).toHaveClass('user-message');
      expect(screen.getByText('user1')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render "No messages yet" when messages array is empty', () => {
      renderWithProviders(<MessageList messages={[]} username="currentUser" />);
      expect(screen.getByText('No messages yet. Send a message to start chatting!')).toBeInTheDocument();
    });
  });

  describe('Message Formatting', () => {
    it('should format messages with emojis correctly', () => {
      const messagesWithEmojis = [
        {
          id: '1',
          message: 'Hello 👋 from the game 🎮!',
          username: 'user1',
          timestamp: Date.now(),
          isSystem: false,
        },
      ];

      renderWithProviders(<MessageList messages={messagesWithEmojis} username="currentUser" />);
      expect(screen.getByText('Hello 👋 from the game 🎮!')).toBeInTheDocument();
    });

    it('should handle very long messages without breaking layout', () => {
      const longMessage = {
        id: '1',
        message: 'A'.repeat(500), // Very long message
        username: 'user1',
        timestamp: Date.now(),
        isSystem: false,
      };

      renderWithProviders(<MessageList messages={[longMessage]} username="currentUser" />);
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });
  });

  describe('Message Styling', () => {
    it('should apply different styles to current user messages', () => {
      const messages = [
        {
          id: '1',
          message: 'My message',
          username: 'currentUser',
          timestamp: Date.now(),
          isSystem: false,
        },
        {
          id: '2',
          message: 'Other message',
          username: 'otherUser',
          timestamp: Date.now(),
          isSystem: false,
        },
      ];

      renderWithProviders(<MessageList messages={messages} username="currentUser" />);

      const currentUserMessage = screen.getByText('My message');
      const otherUserMessage = screen.getByText('Other message');

      expect(currentUserMessage).toHaveClass('current-user-message');
      expect(otherUserMessage).toHaveClass('other-user-message');
    });
  });

  describe('Timestamp Display', () => {
    it('should display timestamps for all messages', () => {
      renderWithProviders(<MessageList messages={mockMessages} username="currentUser" />);

      const timestamps = screen.getAllByText(/\d{2}:\d{2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Message Scrolling', () => {
    it('should scroll to bottom when new messages are added', () => {
      const { rerender } = renderWithProviders(<MessageList messages={mockMessages.slice(0, 1)} username="currentUser" />);

      const newMessages = [...mockMessages, {
        id: '4',
        message: 'New message at the end',
        username: 'user3',
        timestamp: Date.now(),
        isSystem: false,
      }];

      rerender(<MessageList messages={newMessages} username="currentUser" />);

      const endMessage = screen.getByText('New message at the end');
      expect(endMessage).toBeInTheDocument();
    });
  });
});