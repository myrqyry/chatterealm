// Test with GameCanvas to check Rough.js animations
import { useEffect } from 'react';
import './App.css'
import GameCanvas from './components/GameCanvas';
import EnhancedPlayerStatus from './components/EnhancedPlayerStatus';
import ResponsiveLayout from './components/ResponsiveLayout';
import NotificationSystem, { notificationHelpers } from './components/NotificationSystem';
import { useGameStore } from './stores/gameStore';
import { webSocketClient } from './services/webSocketClient';

// Import types from shared package
import { GameWorld, ItemType, ItemRarity } from '../../shared/src/types/game';

// Advanced Terrain Generation System
const createMockGameWorld = (): GameWorld => {
  const grid: any[][] = [];
  const WORLD_WIDTH = 40;
  const WORLD_HEIGHT = 30;

  // Simple noise function for natural terrain generation
  const noise = (x: number, y: number, seed: number = 0) => {
    const n = Math.sin(x * 0.01 + seed) * Math.cos(y * 0.01 + seed) * 0.5 + 0.5;
    return n;
  };

  // Perlin-like noise for smoother transitions
  const perlinNoise = (x: number, y: number, octaves: number = 4) => {
    let value = 0;
    let amplitude = 1;
    let frequency = 0.05;

    for (let i = 0; i < octaves; i++) {
      value += noise(x * frequency, y * frequency, i) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value;
  };

  // Biome generation - create distinct regions with much less ocean
  const getBiome = (x: number, y: number) => {
    const continentNoise = perlinNoise(x, y, 2) * 0.9 + 0.05;
    const temperature = perlinNoise(x * 0.3, y * 0.3, 3) * 0.9 + 0.05;
    const humidity = perlinNoise(x * 0.4, y * 0.4, 4) * 0.9 + 0.05;

    // Continental plates - significantly reduced ocean for maximum land
    if (continentNoise > 0.85) return 'mountain_range';
    if (continentNoise < 0.08) return 'ocean'; // Reduced to 8% ocean coverage

    // Climate-based biomes with better distribution
    if (temperature < 0.2) return 'tundra';
    if (temperature > 0.8 && humidity > 0.7) return 'jungle';
    if (temperature > 0.7 && humidity < 0.3) return 'desert';
    if (humidity > 0.8) return 'swamp';
    if (temperature > 0.6) return 'grassland';

    return 'temperate_forest';
  };

  // Advanced terrain generation with multiple factors
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const biome = getBiome(x, y);
      const elevation = perlinNoise(x * 0.8, y * 0.8, 1);
      const roughness = perlinNoise(x * 1.5, y * 1.5, 2);
      const moisture = perlinNoise(x * 0.6, y * 0.6, 3);

      let terrainType = 'plain';
      let movementCost = 1;
      let defenseBonus = 0;
      let visibilityModifier = 1;
      let resources: string[] = [];
      let specialFeatures: string[] = [];

      // Biome-specific terrain generation
      switch (biome) {
        case 'ocean':
          terrainType = 'water';
          movementCost = 999; // Impassable
          visibilityModifier = 0.9;
          break;

        case 'mountain_range':
          if (elevation > 0.8) {
            terrainType = 'mountain_peak';
            movementCost = 4;
            defenseBonus = 3;
            visibilityModifier = 1.2;
            resources = ['ore', 'gems'];
          } else if (elevation > 0.6) {
            terrainType = 'mountain';
            movementCost = 3;
            defenseBonus = 2;
            visibilityModifier = 1.1;
            resources = ['stone'];
          } else {
            terrainType = 'hills';
            movementCost = 1.5;
            defenseBonus = 1;
            resources = ['stone'];
          }
          break;

        case 'tundra':
          if (roughness > 0.7) {
            terrainType = 'ice';
            movementCost = 2;
            visibilityModifier = 0.9;
          } else if (elevation > 0.5) {
            terrainType = 'snowy_hills';
            movementCost = 1.8;
            defenseBonus = 1;
          } else {
            terrainType = 'snow';
            movementCost = 1.2;
            resources = ['fur'];
          }
          break;

        case 'desert':
          if (roughness > 0.8) {
            terrainType = 'dunes';
            movementCost = 2;
            visibilityModifier = 0.8;
            resources = ['sand'];
          } else if (perlinNoise(x * 2, y * 2, 5) > 0.85) {
            terrainType = 'oasis';
            movementCost = 0.8;
            visibilityModifier = 1.0;
            resources = ['water'];
            specialFeatures = ['healing'];
          } else {
            terrainType = 'sand';
            movementCost = 1.3;
            resources = ['sand'];
          }
          break;

        case 'jungle':
          if (roughness > 0.75) {
            terrainType = 'dense_jungle';
            movementCost = 2.5;
            defenseBonus = 2;
            visibilityModifier = 0.5;
            resources = ['exotic_wood', 'rare_herbs'];
          } else {
            terrainType = 'jungle';
            movementCost = 1.8;
            defenseBonus = 1;
            visibilityModifier = 0.7;
            resources = ['wood', 'herbs'];
          }
          break;

        case 'swamp':
          if (moisture > 0.8) {
            terrainType = 'deep_water';
            movementCost = 999;
            visibilityModifier = 0.8;
          } else if (roughness > 0.6) {
            terrainType = 'marsh';
            movementCost = 2;
            defenseBonus = 1;
            visibilityModifier = 0.8;
            resources = ['reeds'];
          } else {
            terrainType = 'swamp';
            movementCost = 1.5;
            resources = ['reeds', 'herbs'];
          }
          break;

        case 'temperate_forest':
          if (roughness > 0.7) {
            terrainType = 'dense_forest';
            movementCost = 2;
            defenseBonus = 2;
            visibilityModifier = 0.6;
            resources = ['wood', 'mushrooms'];
          } else if (perlinNoise(x * 1.5, y * 1.5, 6) > 0.8) {
            terrainType = 'clearing';
            movementCost = 0.9;
            visibilityModifier = 1.1;
            specialFeatures = ['camp'];
          } else {
            terrainType = 'forest';
            movementCost = 1.5;
            defenseBonus = 1;
            visibilityModifier = 0.8;
            resources = ['wood'];
          }
          break;

        case 'grassland':
          if (roughness > 0.65) {
            terrainType = 'rolling_hills';
            movementCost = 1.3;
            defenseBonus = 1;
            resources = ['grass'];
          } else if (perlinNoise(x * 2.5, y * 2.5, 7) > 0.9) {
            terrainType = 'flower_field';
            movementCost = 1.0;
            visibilityModifier = 1.0;
            resources = ['flowers', 'herbs'];
            specialFeatures = ['beautiful'];
          } else {
            terrainType = 'grassland';
            movementCost = 1.0;
            resources = ['grass', 'herbs'];
          }
          break;

        default: // plain
          if (roughness > 0.6) {
            terrainType = 'rough_terrain';
            movementCost = 1.2;
            resources = ['stones'];
          } else if (perlinNoise(x * 1.8, y * 1.8, 8) > 0.85) {
            terrainType = 'ancient_ruins';
            movementCost = 1.1;
            visibilityModifier = 1.0;
            resources = ['ancient_artifacts'];
            specialFeatures = ['mysterious'];
          } else {
            terrainType = 'plain';
            resources = ['grass'];
          }
      }

      // Add rivers with some probability
      const riverNoise = perlinNoise(x * 0.2, y * 0.2, 9);
      const riverBranch = perlinNoise(x * 0.15, y * 0.15, 10);

      if ((riverNoise > 0.75 && riverBranch > 0.6) || (riverNoise > 0.85)) {
        if (terrainType !== 'ocean' && terrainType !== 'water' && terrainType !== 'mountain_peak') {
          terrainType = 'river';
          movementCost = 2;
          visibilityModifier = 0.9;
          resources = ['water', 'fish'];
          specialFeatures = ['water_source'];
        }
      }

      // Add roads occasionally
      const roadNoise = perlinNoise(x * 0.1, y * 0.1, 11);
      if (roadNoise > 0.92 && movementCost < 3) {
        movementCost = Math.max(0.7, movementCost * 0.8);
        specialFeatures.push('road');
      }

      grid[y][x] = {
        type: terrainType,
        position: { x, y },
        biome,
        elevation,
        roughness,
        moisture,
        movementCost,
        defenseBonus,
        visibilityModifier,
        resources,
        specialFeatures,
        // Additional gameplay properties
        fertility: moisture * (1 - roughness),
        strategicValue: defenseBonus + (resources.length * 0.5),
        explorationBonus: specialFeatures.length * 0.2
      };
    }
  }

  return {
    id: 'mock_world_1',
    grid,
    players: [{
      id: 'player1',
      twitchUsername: 'testuser',
      displayName: 'Test User',
      avatar: '🤠',
      position: { x: 5, y: 5 },
      class: 'knight' as any,
      stats: { hp: 100, maxHp: 120, attack: 15, defense: 20, speed: 8 },
      level: 1,
      experience: 0,
      inventory: [],
      equipment: {},
      achievements: [],
      titles: [],
      isAlive: true,
      lastMoveTime: Date.now(),
      spawnTime: Date.now(),
      connected: true,
      lastActive: Date.now()
    }],
    npcs: [{
      id: 'goblin1',
      name: 'Goblin Scout',
      type: 'goblin',
      position: { x: 12, y: 8 },
      stats: { hp: 60, maxHp: 60, attack: 10, defense: 6, speed: 14 },
      behavior: 'wandering',
      lootTable: [],
      isAlive: true,
      lastMoveTime: Date.now()
    }],
    items: [{
      id: 'sword1',
      name: 'Iron Sword',
      type: ItemType.WEAPON,
      rarity: ItemRarity.UNCOMMON,
      description: 'A well-balanced iron sword',
      stats: { attack: 5 },
      position: { x: 8, y: 6 }
    }],
    cataclysmCircle: {
      center: { x: 10, y: 7 },
      radius: 20,
      isActive: false,
      shrinkRate: 1,
      nextShrinkTime: Date.now() + 300000
    },
    worldAge: 0,
    lastResetTime: Date.now(),
    phase: 'exploration'
  };
};

function App() {
  const {
    gameWorld,
    currentPlayer,
    selectedTab,
    gameMessage,
    animationSettings,
    setGameWorld,
    setCurrentPlayer,
    setSelectedTab,
    setGameMessage,
    updateAnimationSettings,
    movePlayer
  } = useGameStore();

  // Initialize game connection on first load
  useEffect(() => {
    if (!gameWorld && !currentPlayer) {
      // Join the game via WebSocket
      const playerData = {
        id: 'player_' + Date.now(),
        displayName: 'TestPlayer',
        class: 'knight' as any,
        avatar: '🤠'
      };
      webSocketClient.joinGame(playerData);
    }
  }, [gameWorld, currentPlayer]);

  // Enhanced world regeneration with proper store integration
  const handleRegenerateWorld = () => {
    const newWorld = createMockGameWorld();
    setGameWorld(newWorld);
    setCurrentPlayer(newWorld.players[0]);
    setGameMessage('🌍 New world generated! Explore the fresh terrain!');

    // Clear message after 5 seconds
    setTimeout(() => setGameMessage(''), 5000);
  };

  // Handle player movement with store (now uses WebSocket client)
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    movePlayer(direction);
  };

  // Handle joining game via WebSocket
  const handleJoinGame = () => {
    const playerData = {
      id: 'player_' + Date.now(),
      displayName: 'TestPlayer',
      class: 'knight' as any,
      avatar: '🤠'
    };
    webSocketClient.joinGame(playerData);
  };

  return (
    <ResponsiveLayout>
      <NotificationSystem />
      <div className="app-container">
      <div className="main-display">
        <div className="game-header">
          <h1>🗺️ Chat Grid Chronicles - Full Game Test</h1>
          <div className="world-info">
            <span>Phase: exploration</span>
            <span>Players: {gameWorld ? gameWorld.players.length : 0}</span>
            <span>NPCs: {gameWorld ? gameWorld.npcs.length : 0}</span>
            <span>Items: {gameWorld ? gameWorld.items.length : 0}</span>
          </div>
        </div>

        <GameCanvas />

        <div className="game-legend">
          <div className="legend-item">
            <div className="legend-color" style={{background: '#FFD700', borderRadius: '50%'}}></div>
            <span>Knight</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#8B0000', borderRadius: '50%'}}></div>
            <span>Rogue</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#4B0082', borderRadius: '50%'}}></div>
            <span>Mage</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#DC143C', borderRadius: '50%'}}></div>
            <span>NPC</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#F59E0B', borderRadius: '0'}}></div>
            <span>Item</span>
          </div>
        </div>
      </div>

      <div className="player-hub">
        <div className="tabs">
          <button
            className={selectedTab === 'status' ? 'active' : ''}
            onClick={() => setSelectedTab('status')}
          >
            Status
          </button>
          <button
            className={selectedTab === 'actions' ? 'active' : ''}
            onClick={() => setSelectedTab('actions')}
          >
            Actions
          </button>
          <button
            className={selectedTab === 'world' ? 'active' : ''}
            onClick={() => setSelectedTab('world')}
          >
            World Info
          </button>
          <button
            className={selectedTab === 'dev' ? 'active' : ''}
            onClick={() => setSelectedTab('dev')}
            style={{background: '#9b59b6', color: 'white'}}
          >
            ⚙️ Dev Panel
          </button>
        </div>

        <div className="tab-content">
          {selectedTab === 'status' && currentPlayer && (
            <EnhancedPlayerStatus player={currentPlayer} />
          )}

          {selectedTab === 'actions' && (
            <div className="actions-tab">
              <h4>Actions</h4>
              {gameMessage && (
                <div className="game-message" style={{
                  background: 'rgba(52, 152, 219, 0.2)',
                  border: '1px solid #3498db',
                  borderRadius: '5px',
                  padding: '10px',
                  marginBottom: '15px',
                  color: '#ecf0f1'
                }}>
                  {gameMessage}
                </div>
              )}
              <div className="movement-controls">
                <button className="move-btn" onClick={() => handleMove('up')}>↑</button>
                <div className="horizontal-controls">
                  <button className="move-btn" onClick={() => handleMove('left')}>←</button>
                  <button className="move-btn" onClick={() => handleMove('down')}>↓</button>
                  <button className="move-btn" onClick={() => handleMove('right')}>→</button>
                </div>
              </div>
              <div className="action-buttons">
                 <button className="action-btn" onClick={handleJoinGame}>
                   🔌 Join Game
                 </button>
                <button className="action-btn" onClick={() => setGameMessage('Cataclysm started!')}>
                  Start Cataclysm
                </button>
                <button className="action-btn" onClick={() => setGameMessage('Looking for items...')}>
                  Pick Up Item
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'world' && (
            <div className="world-tab">
              <h4>World Information</h4>
              <div className="world-stats">
                <div className="stat-item">
                  <span>Active Players:</span>
                  <span>{gameWorld ? gameWorld.players.filter(p => p.isAlive).length : 0}</span>
                </div>
                <div className="stat-item">
                  <span>World Age:</span>
                  <span>0s</span>
                </div>
                <div className="stat-item">
                  <span>Items Available:</span>
                  <span>{gameWorld ? gameWorld.items.length : 0}</span>
                </div>
                <div className="stat-item">
                  <span>NPCs Active:</span>
                  <span>{gameWorld ? gameWorld.npcs.filter(n => n.isAlive).length : 0}</span>
                </div>
              </div>
              <div className="leaderboard">
                <h5>Top Players</h5>
                {gameWorld ? gameWorld.players
                  .sort((a, b) => b.level - a.level)
                  .slice(0, 3)
                  .map(player => (
                    <div key={player.id} className="leaderboard-item">
                      <span>{player.avatar}</span>
                      <span>{player.displayName}</span>
                      <span>Lvl {player.level}</span>
                    </div>
                  )) : null}
              </div>
            </div>
          )}

          {selectedTab === 'dev' && (
            <div className="dev-tab">
              <h4>🎨 Developer Panel</h4>
              <p style={{fontSize: '0.8em', marginBottom: '15px', color: '#95a5a6'}}>
                Adjust animation and visual settings in real-time
              </p>

              {/* Rough.js Settings */}
              <div className="dev-section">
                <h5>🎯 Rough.js Settings</h5>
                <div className="dev-controls">
                  <div className="control-group">
                    <label>Roughness: {animationSettings.roughness.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={animationSettings.roughness}
                      onChange={(e) => updateAnimationSettings({
                        roughness: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Bowing: {animationSettings.bowing.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={animationSettings.bowing}
                      onChange={(e) => updateAnimationSettings({
                        bowing: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Fill Weight: {animationSettings.fillWeight.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={animationSettings.fillWeight}
                      onChange={(e) => updateAnimationSettings({
                        fillWeight: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Hachure Angle: {animationSettings.hachureAngle}°</label>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="5"
                      value={animationSettings.hachureAngle}
                      onChange={(e) => updateAnimationSettings({
                        hachureAngle: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Hachure Gap: {animationSettings.hachureGap}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={animationSettings.hachureGap}
                      onChange={(e) => updateAnimationSettings({
                        hachureGap: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Animation Settings */}
              <div className="dev-section">
                <h5>🎬 Animation Settings</h5>
                <div className="dev-controls">
                  <div className="control-group">
                    <label>Animation Speed: {animationSettings.animationSpeed.toFixed(1)}x</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={animationSettings.animationSpeed}
                      onChange={(e) => updateAnimationSettings({
                        animationSpeed: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Breathing Rate: {animationSettings.breathingRate.toFixed(3)}</label>
                    <input
                      type="range"
                      min="0.01"
                      max="0.2"
                      step="0.005"
                      value={animationSettings.breathingRate}
                      onChange={(e) => updateAnimationSettings({
                        breathingRate: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Particle Count: {animationSettings.particleCount}</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={animationSettings.particleCount}
                      onChange={(e) => updateAnimationSettings({
                        particleCount: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Wind Speed: {animationSettings.windSpeed.toFixed(3)}</label>
                    <input
                      type="range"
                      min="0"
                      max="0.1"
                      step="0.005"
                      value={animationSettings.windSpeed}
                      onChange={(e) => updateAnimationSettings({
                        windSpeed: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Settings */}
              <div className="dev-section">
                <h5>👁️ Visual Settings</h5>
                <div className="dev-controls">
                  <div className="control-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={animationSettings.showGrid}
                        onChange={(e) => updateAnimationSettings({
                          showGrid: e.target.checked
                        })}
                      />
                      Show Grid
                    </label>
                  </div>

                  <div className="control-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={animationSettings.showParticles}
                        onChange={(e) => updateAnimationSettings({
                          showParticles: e.target.checked
                        })}
                      />
                      Show Particles
                    </label>
                  </div>

                  <div className="control-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={animationSettings.showHealthBars}
                        onChange={(e) => updateAnimationSettings({
                          showHealthBars: e.target.checked
                        })}
                      />
                      Show Health Bars
                    </label>
                  </div>
                </div>
              </div>

              {/* Terrain Settings */}
              <div className="dev-section">
                <h5>🌿 Terrain Settings</h5>
                <div className="dev-controls">
                  <div className="control-group">
                    <label>Grass Wave Speed: {animationSettings.grassWaveSpeed.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={animationSettings.grassWaveSpeed}
                      onChange={(e) => updateAnimationSettings({
                        grassWaveSpeed: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Tree Sway Speed: {animationSettings.treeSwaySpeed.toFixed(3)}</label>
                    <input
                      type="range"
                      min="0"
                      max="0.1"
                      step="0.005"
                      value={animationSettings.treeSwaySpeed}
                      onChange={(e) => updateAnimationSettings({
                        treeSwaySpeed: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="control-group">
                    <label>Flower Spawn Rate: {animationSettings.flowerSpawnRate.toFixed(3)}</label>
                    <input
                      type="range"
                      min="0"
                      max="0.05"
                      step="0.001"
                      value={animationSettings.flowerSpawnRate}
                      onChange={(e) => updateAnimationSettings({
                        flowerSpawnRate: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="dev-section">
                <h5>🔧 Actions</h5>
                <div className="dev-controls">
                  <button
                    onClick={handleRegenerateWorld}
                    style={{background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', marginBottom: '10px'}}
                  >
                    🌍 Regenerate World
                  </button>

                  <button
                    onClick={() => updateAnimationSettings({
                      roughness: 1.5,
                      bowing: 1.2,
                      fillWeight: 1.5,
                      hachureAngle: 45,
                      hachureGap: 4,
                      animationSpeed: 1.0,
                      breathingRate: 0.05,
                      particleCount: 5,
                      windSpeed: 0.02,
                      showGrid: true,
                      showParticles: true,
                      showHealthBars: true,
                      backgroundColor: '#191724',
                      grassWaveSpeed: 0.1,
                      treeSwaySpeed: 0.03,
                      flowerSpawnRate: 0.01,
                      worldWidth: 40,
                      worldHeight: 30
                    })}
                    style={{background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px'}}
                  >
                    🔄 Reset Settings
                  </button>

                  <button
                    onClick={() => {
                      const settings = JSON.stringify(animationSettings, null, 2);
                      navigator.clipboard.writeText(settings);
                      setGameMessage('Settings copied to clipboard!');
                      setTimeout(() => setGameMessage(''), 2000);
                    }}
                    style={{background: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    📋 Copy Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="player-selector">
          <h5>Select Player:</h5>
          {gameWorld ? gameWorld.players.map(player => (
            <button
              key={player.id}
              className={`player-select-btn ${currentPlayer?.id === player.id ? 'active' : ''}`}
              onClick={() => setCurrentPlayer(player)}
            >
              {player.avatar} {player.displayName}
            </button>
          )) : null}
        </div>
      </div>
    </div>
    </ResponsiveLayout>
  )
}

export default App
