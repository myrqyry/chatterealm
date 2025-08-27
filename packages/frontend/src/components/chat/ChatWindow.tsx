import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ChatMessage, Player } from '../../types/chat';

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
      <div className="user-settings">
        <h3>👤 User Settings</h3>
        <div className="user-input-grid">
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
          />
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <input
            type="number"
            placeholder="Channel Points"
            value={channelPoints}
            onChange={(e) => setChannelPoints(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Players List */}
      <div className="players-list">
        <h3>🎭 Active Players ({players.length})</h3>
        {players.length === 0 ? (
          <p style={{ color: '#908caa', padding: '10px' }}>No players in game</p>
        ) : (
          players.map(player => (
            <div key={player.id} className="player-card">
              <span className="player-avatar-small">{player.avatar}</span>
              <div className="player-info">
                <h4>{player.displayName}</h4>
                <div className="player-stats">
                  HP: {player.stats.hp}/{player.stats.maxHp} |
                  ATK: {player.stats.attack} |
                  DEF: {player.stats.defense} |
                  Pos: ({player.position.x}, {player.position.y})
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <MessageList messages={messages} username={username} />

      <MessageInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleKeyPress={handleKeyPress}
        sendChatCommand={sendChatCommand}
        isConnected={isConnected}
      />

      {/* Preset Commands */}
      <div className="quick-commands">
        <h3>⚡ Quick Commands</h3>
        <div className="command-buttons">
          {presetCommands.map(command => (
            <button
              key={command}
              onClick={() => setInputMessageAndFocus(command)}
              className="command-btn"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="help-section">
        <h3>📖 How to Use</h3>
        <ul className="help-list">
          <li>Change your username and display name above</li>
          <li>Type commands starting with <code>!</code> (like <code>!help</code>)</li>
          <li>Click preset commands or type your own</li>
          <li>Watch the chat responses and player list update in real-time</li>
          <li>Try <code>!spawn knight</code> to join the game!</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatWindow;