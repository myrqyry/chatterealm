import React from 'react';
import { Player } from '../../types/chat';
import { useChat } from '../../hooks/useChat';
import ChatWindow from './ChatWindow';
import { commandProcessor } from '../../services/chat/CommandProcessor'; // Import the commandProcessor

interface ChatInterfaceProps {
  players: Player[];
  onWorldUpdate: (players: Player[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ players, onWorldUpdate }) => {
  const {
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
    setInputMessageAndFocus,
  } = useChat(onWorldUpdate);

  const presetCommands = commandProcessor.getPresetCommands();

  return (
    <ChatWindow
      messages={messages}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      handleKeyPress={handleKeyPress}
      sendChatCommand={sendChatCommand}
      isConnected={isConnected}
      username={username}
      displayName={displayName}
      channelPoints={channelPoints}
      setChannelPoints={setChannelPoints}
      players={players}
      presetCommands={presetCommands}
      setInputMessageAndFocus={setInputMessageAndFocus}
    />
  );
};

export default ChatInterface;