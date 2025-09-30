import React, { useState, useEffect } from 'react';
import GameCanvas from './GameCanvas';
import { useGameStore } from '../stores/gameStore';

export const CataclysmDemo: React.FC = () => {
  const { gameWorld } = useGameStore();
  const [cataclysmProgress, setCataclysmProgress] = useState(0);
  const [isCataclysmActive, setIsCataclysmActive] = useState(false);

  // Simulate cataclysm progress for demo
  useEffect(() => {
    if (gameWorld?.phase === 'cataclysm') {
      setIsCataclysmActive(true);
      const initialRadius = Math.max(60, 30); // Approximate grid size
      const currentRadius = gameWorld.cataclysmCircle.radius;
      const progress = 1 - (currentRadius / initialRadius);
      setCataclysmProgress(progress);
    } else if (gameWorld?.phase === 'rebirth') {
      setIsCataclysmActive(false);
      setCataclysmProgress(0);
    } else {
      setIsCataclysmActive(false);
      setCataclysmProgress(0);
    }
  }, [gameWorld?.phase, gameWorld?.cataclysmCircle.radius]);

  const roughnessMultiplier = gameWorld?.cataclysmRoughnessMultiplier ?? 1.0;

  return (
    <div className="cataclysm-demo p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Cataclysm Effects Demo</h2>

      {/* Status Display */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">World Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Phase:</span>
            <span className={`ml-2 font-medium ${
              gameWorld?.phase === 'cataclysm' ? 'text-red-400' :
              gameWorld?.phase === 'rebirth' ? 'text-green-400' :
              'text-blue-400'
            }`}>
              {gameWorld?.phase || 'exploration'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Cataclysm Active:</span>
            <span className={`ml-2 font-medium ${isCataclysmActive ? 'text-red-400' : 'text-green-400'}`}>
              {isCataclysmActive ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Roughness Multiplier:</span>
            <span className="ml-2 font-medium text-yellow-400">
              {roughnessMultiplier.toFixed(2)}x
            </span>
          </div>
          <div>
            <span className="text-gray-400">Cataclysm Progress:</span>
            <span className="ml-2 font-medium text-orange-400">
              {(cataclysmProgress * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Normal</span>
            <span>Chaotic</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, cataclysmProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
        <div className="text-gray-300 text-sm space-y-2">
          <p><strong>During Cataclysm:</strong> Terrain roughness increases progressively from 1.0x to 4.0x as the cataclysm circle shrinks, creating increasingly chaotic and "jumbled" visuals.</p>
          <p><strong>Rebirth Phase:</strong> After cataclysm ends, the world enters a 5-second rebirth phase with animated regeneration effects showing new terrain being created.</p>
          <p><strong>Visual Effects:</strong> Circles, stars, and lightning bolts appear across the map during regeneration, symbolizing the rebirth of the world.</p>
          <p><strong>Player Impact:</strong> Players inside the cataclysm circle are eliminated, and the world resets with fresh terrain and NPCs.</p>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
        <GameCanvas />
      </div>

      {/* Technical Details */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Technical Implementation</h3>
        <div className="text-gray-300 text-sm space-y-1">
          <p>• <code>cataclysmRoughnessMultiplier</code> in GameWorld state</p>
          <p>• Roughness increases from 1.0 to 4.0 during cataclysm progression</p>
          <p>• Canvas drawing effects for rebirth animations</p>
          <p>• Phase transitions: exploration → cataclysm → rebirth → exploration</p>
          <p>• GSAP-powered smooth transitions between roughness levels</p>
        </div>
      </div>
    </div>
  );
};