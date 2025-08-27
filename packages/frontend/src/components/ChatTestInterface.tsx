import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

interface ChatMessage {
  message: string;
  timestamp: number;
  isResponse: boolean;
  originalMessage?: string;
  username?: string;
  displayName?: string;
}

interface Player {
  id: string;
  twitchUsername: string;
  displayName: string;
  avatar: string;
  position: { x: number; y: number };
  class: string;
  stats: { hp: number; maxHp: number; attack: number; defense: number; speed: number };
  level: number;
  experience: number;
  inventory: any[];
  equipment: any;
  achievements: string[];
  titles: string[];
  isAlive: boolean;
  lastMoveTime: number;
  spawnTime: number;
}

interface ChatTestInterfaceProps {
  players: Player[];
  onWorldUpdate: (players: Player[]) => void;
}

const ChatTestInterface: React.FC<ChatTestInterfaceProps> = ({ players, onWorldUpdate }) => {
  // Socket connection for real-time updates (currently using REST API for commands)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('testuser');
  const [displayName, setDisplayName] = useState('Test User');
  const [channelPoints, setChannelPoints] = useState(1000);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the backend
    const newSocket = io('http://localhost:3002');

    newSocket.on('connect', () => {
      console.log('🎮 [SOCKET] Connected to backend');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [SOCKET] Disconnected from backend');
      setIsConnected(false);
    });

    newSocket.on('chat_message', (data: ChatMessage) => {
      console.log('💬 [SOCKET] Received chat message:', data);
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('world_update', (worldData: any) => {
      console.log('🌍 [SOCKET] Received world update:', {
        players: worldData.players?.length || 0,
        phase: worldData.phase
      });
      // Update the main game world state via props
      onWorldUpdate(worldData.players || []);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendChatCommand = async () => {
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch('http://localhost:3002/api/test/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          displayName,
          message: inputMessage,
          channelPoints
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add the original message to the chat
        setMessages(prev => [...prev, {
          message: inputMessage,
          timestamp: Date.now(),
          isResponse: false,
          username,
          displayName
        }]);
      }

      setInputMessage('');
    } catch (error) {
      console.error('Error sending chat command:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendChatCommand();
    }
  };

  const presetCommands = [
    '!help',
    '!spawn knight',
    '!spawn rogue',
    '!spawn mage',
    '!move up',
    '!move down',
    '!move left',
    '!move right',
    '!status'
  ];

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
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p style={{ color: '#6e6a86', textAlign: 'center', marginTop: '50px' }}>
            No messages yet. Try sending a command!
          </p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.isResponse ? 'bot' : 'user'}`}>
              <div className="message-sender">
                {msg.isResponse ? '🤖 Bot' : `👤 ${msg.displayName || username}`}
              </div>
              <div className="message-text">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
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

      {/* Preset Commands */}
      <div className="quick-commands">
        <h3>⚡ Quick Commands</h3>
        <div className="command-buttons">
          {presetCommands.map(command => (
            <button
              key={command}
              onClick={() => setInputMessage(command)}
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

export default ChatTestInterface;
