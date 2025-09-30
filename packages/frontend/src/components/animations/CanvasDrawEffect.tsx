import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

export interface CanvasDrawEffectProps {
  /** Canvas context to draw on */
  ctx: CanvasRenderingContext2D;
  /** Path data - either SVG path string or array of points */
  path: string | Array<{x: number, y: number}>;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Whether to auto-play the animation */
  autoPlay?: boolean;
  /** Stroke color */
  strokeColor?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Animation ease */
  ease?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Whether to clear canvas before drawing */
  clearBeforeDraw?: boolean;
  /** Position offset */
  offset?: { x: number; y: number };
}

export class CanvasDrawEffect {
  private ctx: CanvasRenderingContext2D;
  private path: string | Array<{x: number, y: number}>;
  private duration: number;
  private delay: number;
  private strokeColor: string;
  private strokeWidth: number;
  private ease: string;
  private onComplete?: () => void;
  private clearBeforeDraw: boolean;
  private offset: { x: number; y: number };
  private animation?: gsap.core.Timeline;

  constructor(props: CanvasDrawEffectProps) {
    this.ctx = props.ctx;
    this.path = props.path;
    this.duration = props.duration || 2;
    this.delay = props.delay || 0;
    this.strokeColor = props.strokeColor || '#ffffff';
    this.strokeWidth = props.strokeWidth || 2;
    this.ease = props.ease || 'power2.out';
    this.onComplete = props.onComplete;
    this.clearBeforeDraw = props.clearBeforeDraw ?? false;
    this.offset = props.offset || { x: 0, y: 0 };

    if (props.autoPlay !== false) {
      this.play();
    }
  }

  private parseSVGPath(pathData: string): Array<{x: number, y: number}> {
    // Simple SVG path parser for basic M, L, C commands
    const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || [];
    const points: Array<{x: number, y: number}> = [];
    let currentX = 0;
    let currentY = 0;

    commands.forEach(command => {
      const type = command[0];
      const args = command.slice(1).trim().split(/[\s,]+/).map(Number);

      switch (type) {
        case 'M':
        case 'L':
          if (args.length >= 2) {
            currentX = args[0];
            currentY = args[1];
            points.push({ x: currentX + this.offset.x, y: currentY + this.offset.y });
          }
          break;
        case 'H':
          currentX = args[0];
          points.push({ x: currentX + this.offset.x, y: currentY + this.offset.y });
          break;
        case 'V':
          currentY = args[0];
          points.push({ x: currentX + this.offset.x, y: currentY + this.offset.y });
          break;
        // Add more command support as needed
      }
    });

    return points;
  }

  private getPathPoints(): Array<{x: number, y: number}> {
    if (Array.isArray(this.path)) {
      return this.path.map(p => ({ x: p.x + this.offset.x, y: p.y + this.offset.y }));
    } else {
      return this.parseSVGPath(this.path);
    }
  }

  play() {
    const points = this.getPathPoints();
    if (points.length < 2) return;

    // Kill any existing animation
    this.stop();

    this.animation = gsap.timeline({
      delay: this.delay,
      onComplete: this.onComplete
    });

    // Animate drawing by revealing segments progressively
    for (let i = 1; i < points.length; i++) {
      const startPoint = points[i - 1];
      const endPoint = points[i];
      const segmentDuration = this.duration / (points.length - 1);

      this.animation.add(() => {
        if (this.clearBeforeDraw) {
          this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        }

        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.stroke();
      }, i * segmentDuration);
    }
  }

  stop() {
    if (this.animation) {
      this.animation.kill();
      this.animation = undefined;
    }
  }

  reset() {
    this.stop();
    if (this.clearBeforeDraw) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }
}

// React hook for canvas drawing effects
export const useCanvasDrawEffect = (
  ctx: CanvasRenderingContext2D | null,
  path: string | Array<{x: number, y: number}>,
  options: Omit<CanvasDrawEffectProps, 'ctx' | 'path'> = {}
) => {
  const effectRef = useRef<CanvasDrawEffect | null>(null);

  useEffect(() => {
    if (!ctx) return;

    effectRef.current = new CanvasDrawEffect({
      ctx,
      path,
      ...options
    });

    return () => {
      effectRef.current?.stop();
    };
  }, [ctx, path, options]);

  const play = useCallback(() => {
    effectRef.current?.play();
  }, []);

  const stop = useCallback(() => {
    effectRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    effectRef.current?.reset();
  }, []);

  return { play, stop, reset };
};

// Utility functions for common canvas drawing effects
export const createCanvasCirclePath = (
  centerX: number,
  centerY: number,
  radius: number,
  segments: number = 32
): Array<{x: number, y: number}> => {
  const points: Array<{x: number, y: number}> = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    });
  }
  return points;
};

export const createCanvasRectanglePath = (
  x: number,
  y: number,
  width: number,
  height: number
): Array<{x: number, y: number}> => {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
    { x, y } // Close the rectangle
  ];
};

export const createCanvasLightningPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  segments: number = 8,
  intensity: number = 20
): Array<{x: number, y: number}> => {
  const points: Array<{x: number, y: number}> = [{ x: startX, y: startY }];

  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;

  for (let i = 1; i < segments; i++) {
    const baseX = startX + dx * i;
    const baseY = startY + dy * i;
    const offset = (Math.random() - 0.5) * intensity;

    // Perpendicular offset
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const offsetX = Math.cos(angle) * offset;
    const offsetY = Math.sin(angle) * offset;

    points.push({
      x: baseX + offsetX,
      y: baseY + offsetY
    });
  }

  points.push({ x: endX, y: endY });
  return points;
};

export const createCanvasStarPath = (
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  points: number = 5
): Array<{x: number, y: number}> => {
  const coords: Array<{x: number, y: number}> = [];
  const angle = Math.PI / points;

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(i * angle - Math.PI / 2) * radius;
    const y = centerY + Math.sin(i * angle - Math.PI / 2) * radius;
    coords.push({ x, y });
  }

  return coords;
};

// React component for canvas drawing effects
export interface CanvasDrawEffectComponentProps extends Omit<CanvasDrawEffectProps, 'ctx'> {
  /** Canvas ref to draw on */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Whether the effect is active */
  active?: boolean;
}

export const CanvasDrawEffectComponent: React.FC<CanvasDrawEffectComponentProps> = ({
  canvasRef,
  path,
  active = true,
  ...props
}) => {
  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const effect = new CanvasDrawEffect({
      ctx,
      path,
      ...props
    });

    return () => {
      effect.stop();
    };
  }, [canvasRef, path, active, props]);

  return null; // This component doesn't render anything visible
};