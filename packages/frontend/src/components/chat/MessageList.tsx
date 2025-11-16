import React from 'react';
import { ChatMessage } from '../../types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  username: string; // Add username prop here
}

const MessageList: React.FC<MessageListProps> = ({ messages, username }) => {
  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <p style={{ color: '#6e6a86', textAlign: 'center', marginTop: '50px' }}>
          No messages yet. Try sending a command!
        </p>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.isResponse ? 'bot' : 'user'} ${
              msg.isError ? 'error' : ''
            }`}
          >
            <div className="message-sender">
              {msg.isError
                ? '🚫 System Error'
                : msg.isResponse
                ? '🤖 Bot'
                : `👤 ${msg.displayName || username}`}
            </div>
            <div
              className="message-text"
              style={{ color: msg.isError ? '#ff5f5f' : 'inherit' }}
            >
              {msg.message}
            </div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;