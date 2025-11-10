import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chat/ChatService';
import { messageHandler } from '../services/chat/MessageHandler';
import { ChatMessage, Player } from '../types/chat';
import NaturalLanguageCommandParser from '../services/commandParser';

interface UseChatHook {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  username: string;
  setUsername: (username: string) => void;
  displayName: string;
  setDisplayName: (displayName: string) => void;
  channelPoints: number;
  setChannelPoints: (points: number) => void;
  isConnected: boolean;
  sendChatCommand: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  players: Player[];
  setInputMessageAndFocus: (message: string) => void;
}

/**
 * Custom hook for managing chat functionality in the game.
 *
 * This hook provides a complete chat interface including message handling,
 * user input management, connection status, and player list updates.
 *
 * @param onWorldUpdate - Callback function called when the player list is updated
 * @returns Object containing chat state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   inputMessage,
 *   setInputMessage,
 *   sendChatCommand,
 *   isConnected
 * } = useChat((players) => {
 *   console.log('Players updated:', players);
 * });
 * ```
 */
export const useChat = (onWorldUpdate: (players: Player[]) => void): UseChatHook => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('testuser');
  const [displayName, setDisplayName] = useState('Test User');
  const [channelPoints, setChannelPoints] = useState(1000);
  const [isConnected, setIsConnected] = useState(chatService.isConnected);
  const [players, setPlayers] = useState<Player[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messageHandler.setUpdateMessagesCallback(setMessages);
    chatService.setOnMessageReceived(messageHandler.handleNewMessage.bind(messageHandler));
    chatService.setOnWorldUpdateReceived((worldPlayers) => {
      setPlayers(worldPlayers);
      onWorldUpdate(worldPlayers);
    });

    setIsConnected(chatService.isConnected); // Initial connection status
    return () => {
      chatService.closeConnection();
    };
  }, [onWorldUpdate]);

  const sendChatCommand = async () => {
    if (!inputMessage.trim()) return;

    messageHandler.addSentMessage(inputMessage, username, displayName);
    const commandParser = new NaturalLanguageCommandParser();
    const command = await commandParser.parseCommand(inputMessage);
    let success = false;
    if (command) {
        success = await chatService.sendGameCommand(username, displayName, command, channelPoints);
    } else {
        success = await chatService.sendChatCommand(username, displayName, inputMessage, channelPoints);
    }

    if (success) {
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatCommand();
    }
  };

  const setInputMessageAndFocus = (message: string) => {
    setInputMessage(message);
    // Focus the input field after setting the message
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    username,
    setUsername,
    displayName,
    setDisplayName,
    channelPoints,
    setChannelPoints,
    isConnected,
    sendChatCommand,
    handleKeyPress,
    players,
    setInputMessageAndFocus,
  };
};