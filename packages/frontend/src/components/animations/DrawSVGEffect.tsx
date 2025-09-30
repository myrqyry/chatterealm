import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

// Register the plugin
gsap.registerPlugin(DrawSVGPlugin);

export interface DrawSVGEffectRef {
  play: () => void;
  reset: () => void;
  isAnimating: boolean;
}

export interface DrawSVGEffectProps {
  /** Unique ID for the effect */
  id: string;
  /** SVG path data to animate */
  pathData: string;
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
  /** Fill color (optional) */
  fillColor?: string;
  /** Animation ease */
  ease?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Custom CSS classes */
  className?: string;
  /** Position offset from top-left of container */
  position?: { x: number; y: number };
  /** Size of the SVG element */
  size?: { width: number; height: number };
}

export const DrawSVGEffect = React.forwardRef<DrawSVGEffectRef, DrawSVGEffectProps>(({
  id,
  pathData,
  duration = 2,
  delay = 0,
  autoPlay = true,
  strokeColor = '#ffffff',
  strokeWidth = 2,
  fillColor,
  ease = 'power2.out',
  onComplete,
  className = '',
  position = { x: 0, y: 0 },
  size = { width: 100, height: 100 }
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const play = React.useCallback(() => {
    if (!pathRef.current) return;

    setIsAnimating(true);
    gsap.fromTo(pathRef.current,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration,
        ease,
        onComplete: () => {
          setIsAnimating(false);
          onComplete?.();
        }
      }
    );
  }, [duration, ease, onComplete]);

  const reset = React.useCallback(() => {
    if (pathRef.current) {
      gsap.set(pathRef.current, { drawSVG: '0%' });
      setIsAnimating(false);
    }
  }, []);

  React.useImperativeHandle(ref, () => ({
    play,
    reset,
    isAnimating
  }), [play, reset, isAnimating]);

  useEffect(() => {
    if (!pathRef.current || !autoPlay) return;

    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        setIsAnimating(false);
        onComplete?.();
      }
    });

    tl.fromTo(pathRef.current,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration,
        ease,
        onStart: () => setIsAnimating(true)
      }
    );

    return () => {
      tl.kill();
    };
  }, [pathData, duration, delay, autoPlay, ease, onComplete]);

  return (
    <svg
      ref={svgRef}
      className={`draw-svg-effect ${className}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        pointerEvents: 'none',
        zIndex: 10
      }}
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      <path
        ref={pathRef}
        d={pathData}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={fillColor || 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

// Utility component for multiple connected paths
export interface DrawSVGPathEffectProps {
  paths: Array<{
    id: string;
    pathData: string;
    strokeColor?: string;
    strokeWidth?: number;
    delay?: number;
  }>;
  duration?: number;
  stagger?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export const DrawSVGPathEffect: React.FC<DrawSVGPathEffectProps> = ({
  paths,
  duration = 1,
  stagger = 0.2,
  autoPlay = true,
  onComplete,
  position = { x: 0, y: 0 },
  size = { width: 100, height: 100 }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (!autoPlay || pathRefs.current.length === 0) return;

    const tl = gsap.timeline({
      onComplete
    });

    pathRefs.current.forEach((path, index) => {
      if (path) {
        tl.fromTo(path,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            duration,
            ease: 'power2.out'
          },
          index * stagger
        );
      }
    });

    return () => {
      tl.kill();
    };
  }, [paths, duration, stagger, autoPlay, onComplete]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        pointerEvents: 'none',
        zIndex: 10
      }}
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      {paths.map((pathConfig, index) => (
        <path
          key={pathConfig.id}
          ref={(el) => pathRefs.current[index] = el}
          d={pathConfig.pathData}
          stroke={pathConfig.strokeColor || '#ffffff'}
          strokeWidth={pathConfig.strokeWidth || 2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

// Utility functions for common game effects
export const createCircleDrawEffect = (
  centerX: number,
  centerY: number,
  radius: number
): string => {
  return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY + 0.01}`;
};

export const createRectangleDrawEffect = (
  x: number,
  y: number,
  width: number,
  height: number
): string => {
  return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
};

export const createLightningBoltEffect = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  segments: number = 5
): string => {
  const points = [];
  points.push([startX, startY]);

  const dx = (endX - startX) / segments;
  const dy = (endY - startY) / segments;

  for (let i = 1; i < segments; i++) {
    const x = startX + dx * i;
    const y = startY + dy * i;
    const offset = (Math.random() - 0.5) * 20;
    points.push([x + offset, y + offset]);
  }

  points.push([endX, endY]);

  return 'M ' + points.map(([x, y]) => `${x} ${y}`).join(' L ');
};

export const createStarDrawEffect = (
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  points: number = 5
): string => {
  const angle = Math.PI / points;
  let path = '';

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(i * angle - Math.PI / 2) * radius;
    const y = centerY + Math.sin(i * angle - Math.PI / 2) * radius;

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }

  return path + ' Z';
};