import React from 'react';

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  sendChatCommand: () => void;
  isConnected: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  setInputMessage,
  handleKeyPress,
  sendChatCommand,
  isConnected,
}) => {
  return (
    <div className="message-input-area">
      <input
        type="text"
        placeholder="Type a command (e.g., !help, !spawn knight)"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className="message-input"
      />
      <button
        onClick={sendChatCommand}
        disabled={!isConnected}
        className="send-button"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;