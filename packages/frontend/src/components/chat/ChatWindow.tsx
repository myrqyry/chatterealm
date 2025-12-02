import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ChatMessage, Player } from '../../types/chat';
import SmartSuggestions from './SmartSuggestions';
import MaterialButton from '../../ui/MaterialButton';
import MaterialCard from '../../ui/MaterialCard';

interface ChatWindowProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  sendChatCommand: () => void;
  isConnected: boolean;
  username: string;
  displayName: string;
  channelPoints: number;
  setChannelPoints: (points: number) => void;
  players: Player[];
  presetCommands: string[];
  setInputMessageAndFocus: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  inputMessage,
  setInputMessage,
  handleKeyPress,
  sendChatCommand,
  isConnected,
  username,
  displayName,
  channelPoints,
  setChannelPoints,
  players,
  presetCommands,
  setInputMessageAndFocus,
}) => {
  return (
    <div className="chat-container">
      <h1 style={{ color: '#e0def4', marginBottom: '20px', fontSize: '1.5em' }}>
        🎮 Chat Grid Chronicles - Chat Test Interface
      </h1>

      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* User Settings */}
      <MaterialCard title="👤 User Settings" className="mb-4">
        <div className="user-input-grid grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              // Ensure username always starts with 'testuser' if changed.
              const value = e.target.value;
              if (value.startsWith('testuser') || value === '') {
                // If it starts with 'testuser' or is empty, allow direct setting
                setInputMessage(value);
              } else {
                // Prepend 'testuser' if it's changed to something else.
                setInputMessage(`testuser${value}`);
              }
            }}
            className="px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setInputMessage(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Channel Points"
            value={channelPoints}
            onChange={(e) => setChannelPoints(Number(e.target.value))}
            className="px-3 py-2 border rounded"
          />
        </div>
      </MaterialCard>

      {/* Players List */}
      <MaterialCard title={`🎭 Active Players (${players.length})`} className="mb-4">
        {players.length === 0 ? (
          <p className="text-gray-500 p-2">No players in game</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {players.map(player => (
              <MaterialCard key={player.id} className="flex items-center space-x-3">
                <span className="text-2xl">{player.avatar}</span>
                <div className="flex-1">
                  <div className="font-semibold">{player.displayName}</div>
                  <div className="text-sm text-gray-500">
                    HP: {player.stats.hp}/{player.stats.maxHp} |
                    ATK: {player.stats.attack} |
                    DEF: {player.stats.defense} |
                    Pos: ({player.position.x}, {player.position.y})
                  </div>
                </div>
              </MaterialCard>
            ))}
          </div>
        )}
      </MaterialCard>

      <MessageList messages={messages} username={username} />

      <div style={{ position: 'relative' }}>
        <SmartSuggestions
            currentInput={inputMessage}
            gameContext={{
                recentMessages: messages.slice(-5).map(m => m.message),
                activeQuests: [], // This will need to be passed down from the game state
                nearbyPlayers: players.map(p => p.displayName),
                currentActivity: 'chatting', // This will need to be passed down from the game state
            }}
            onSelectSuggestion={(suggestion) => setInputMessageAndFocus(suggestion)}
        />
        <MessageInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleKeyPress={handleKeyPress}
            sendChatCommand={sendChatCommand}
            isConnected={isConnected}
        />
      </div>

      {/* Preset Commands */}
      <MaterialCard title="⚡ Quick Commands" className="mb-4">
        <div className="flex flex-wrap gap-2">
          {presetCommands.map(command => (
            <MaterialButton
              key={command}
              onClick={() => setInputMessageAndFocus(command)}
              variant="outline"
              size="sm"
              className="mb-2"
            >
              {command}
            </MaterialButton>
          ))}
        </div>
      </MaterialCard>

      {/* Help */}
      <MaterialCard title="📖 How to Use">
        <ul className="space-y-2 list-disc list-inside">
          <li>Change your username and display name above</li>
          <li>Type commands starting with <code>!</code> (like <code>!help</code>)</li>
          <li>Click preset commands or type your own</li>
          <li>Watch the chat responses and player list update in real-time</li>
          <li>Try <code>!spawn knight</code> to join the game!</li>
        </ul>
      </MaterialCard>
    </div>
  );
};

export default ChatWindow;