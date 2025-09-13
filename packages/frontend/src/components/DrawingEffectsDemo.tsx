import React, { useState, useRef } from 'react';
import {
  CanvasDrawEffectComponent,
  createCanvasCirclePath,
  createCanvasLightningPath,
  createCanvasStarPath,
  createCanvasRectanglePath
} from './animations/CanvasDrawEffect';
import { DrawSVGEffect } from './animations/DrawSVGEffect';

export const DrawingEffectsDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeEffects, setActiveEffects] = useState<Array<{
    id: string;
    path: Array<{x: number, y: number}>;
    active: boolean;
    duration?: number;
    strokeColor?: string;
  }>>([]);

  const triggerCanvasEffect = (effectType: string) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const effectId = `demo-${Date.now()}-${Math.random()}`;

    let path: Array<{x: number, y: number}>;
    let strokeColor: string;
    let duration: number;

    switch (effectType) {
      case 'circle':
        path = createCanvasCirclePath(centerX, centerY, 50, 32);
        strokeColor = '#00ff88';
        duration = 2;
        break;
      case 'lightning':
        path = createCanvasLightningPath(centerX - 50, centerY - 50, centerX + 50, centerY + 50, 8, 20);
        strokeColor = '#ffff00';
        duration = 1;
        break;
      case 'star':
        path = createCanvasStarPath(centerX, centerY, 40, 20, 6);
        strokeColor = '#ff6b6b';
        duration = 2.5;
        break;
      case 'rectangle':
        path = createCanvasRectanglePath(centerX - 40, centerY - 30, 80, 60);
        strokeColor = '#4ecdc4';
        duration = 1.5;
        break;
      default:
        path = createCanvasCirclePath(centerX, centerY, 30);
        strokeColor = '#ffffff';
        duration = 1;
    }

    setActiveEffects(prev => [...prev, {
      id: effectId,
      path,
      active: true,
      duration,
      strokeColor
    }]);

    // Remove effect after animation completes
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(effect => effect.id !== effectId));
    }, duration * 1000 + 100);
  };

  return (
    <div className="drawing-effects-demo p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Drawing Effects Demo</h2>

      {/* Canvas for drawing effects */}
      <div className="relative border-2 border-gray-600 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="bg-gray-900 block"
          style={{ width: '600px', height: '400px' }}
        />
        {activeEffects.map(effect => (
          <CanvasDrawEffectComponent
            key={effect.id}
            canvasRef={canvasRef}
            path={effect.path}
            active={effect.active}
            duration={effect.duration}
            strokeColor={effect.strokeColor}
            strokeWidth={4}
            clearBeforeDraw={false}
          />
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => triggerCanvasEffect('circle')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Draw Circle
        </button>
        <button
          onClick={() => triggerCanvasEffect('lightning')}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          Draw Lightning
        </button>
        <button
          onClick={() => triggerCanvasEffect('star')}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Draw Star
        </button>
        <button
          onClick={() => triggerCanvasEffect('rectangle')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          Draw Rectangle
        </button>
      </div>

      {/* SVG Drawing Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">SVG Drawing Effects</h3>
        <div className="relative bg-gray-800 p-4 rounded-lg" style={{ height: '200px' }}>
          <DrawSVGEffect
            id="svg-circle"
            pathData="M 100 100 A 50 50 0 1 1 99.9 100"
            duration={2}
            strokeColor="#00ff88"
            strokeWidth={3}
            position={{ x: 0, y: 0 }}
            size={{ width: 200, height: 200 }}
          />
          <DrawSVGEffect
            id="svg-lightning"
            pathData="M 250 50 L 260 70 L 245 75 L 265 95 L 250 100 L 270 130 L 255 135 L 275 165"
            duration={1.5}
            strokeColor="#ffff00"
            strokeWidth={3}
            position={{ x: 0, y: 0 }}
            size={{ width: 200, height: 200 }}
            delay={0.5}
          />
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Usage Examples</h3>
        <div className="text-gray-300 text-sm space-y-2">
          <p><strong>Canvas Effects:</strong> Perfect for dynamic game effects that draw directly on the game canvas</p>
          <p><strong>SVG Effects:</strong> Great for UI overlays, skill effects, and decorative animations</p>
          <p><strong>Integration:</strong> Effects are triggered by game events like player movement, attacks, or achievements</p>
          <p><strong>Customization:</strong> Easily customize colors, timing, and paths for different game scenarios</p>
        </div>
      </div>
    </div>
  );
};