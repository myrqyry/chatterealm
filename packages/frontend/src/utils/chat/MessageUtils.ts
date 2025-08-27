import { ChatMessage } from '../../types/chat';

export const formatMessage = (message: ChatMessage): string => {
  const sender = message.isResponse ? 'Bot' : message.displayName || message.username;
  const time = new Date(message.timestamp).toLocaleTimeString();
  return `[${time}] ${sender}: ${message.message}`;
};

export const getMessageDisplayClass = (message: ChatMessage): string => {
  return message.isResponse ? 'bot-message' : 'user-message';
};