import { useState, useCallback } from 'react';
import { createCanvasCirclePath, createCanvasLightningPath, createCanvasStarPath } from '../../animations/CanvasDrawEffect';

interface DrawEffect {
  id: string;
  path: Array<{ x: number; y: number }>;
  active: boolean;
  duration?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

interface EffectManagerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useEffectManager = ({ canvasRef }: EffectManagerProps) => {
  const [drawEffects, setDrawEffects] = useState<DrawEffect[]>([]);

  const triggerDrawEffect = useCallback((
    x: number,
    y: number,
    effectType: 'circle' | 'lightning' | 'star' = 'circle'
  ) => {
    const effectId = `effect-${Date.now()}-${Math.random()}`;

    let path: Array<{ x: number; y: number }>;
    let strokeColor: string;
    let duration: number;
    let strokeWidth: number = 3;

    switch (effectType) {
      case 'circle':
        path = createCanvasCirclePath(x, y, 30, 16);
        strokeColor = '#00ff88';
        duration = 1.5;
        break;
      case 'lightning':
        const endX = x + (Math.random() - 0.5) * 100;
        const endY = y + (Math.random() - 0.5) * 100;
        path = createCanvasLightningPath(x, y, endX, endY, 6, 15);
        strokeColor = '#ffff00';
        duration = 0.8;
        strokeWidth = 2;
        break;
      case 'star':
        path = createCanvasStarPath(x, y, 25, 15, 5);
        strokeColor = '#ff6b6b';
        duration = 2;
        strokeWidth = 2;
        break;
      default:
        path = createCanvasCirclePath(x, y, 20);
        strokeColor = '#ffffff';
        duration = 1;
    }

    setDrawEffects(prev => [...prev, {
      id: effectId,
      path,
      active: true,
      duration,
      strokeColor,
      strokeWidth
    }]);

    setTimeout(() => {
      setDrawEffects(prev => prev.filter(effect => effect.id !== effectId));
    }, duration * 1000 + 100);
  }, [canvasRef]);

  return {
    drawEffects,
    triggerDrawEffect,
  };
};
