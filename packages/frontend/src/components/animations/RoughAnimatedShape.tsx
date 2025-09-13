import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';

interface RoughAnimatedShapeProps {
  width?: number;
  height?: number;
  animationType?: 'draw' | 'fade' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots' | 'dashed' | 'zigzag-line';
  shape?: 'rectangle' | 'circle' | 'ellipse' | 'line' | 'path';
  shapeProps?: any;
  className?: string;
}

export const RoughAnimatedShape: React.FC<RoughAnimatedShapeProps> = ({
  width = 200,
  height = 200,
  animationType = 'draw',
  duration = 2,
  delay = 0,
  roughness = 1,
  stroke = '#000',
  strokeWidth = 2,
  fill = 'transparent',
  fillStyle = 'hachure',
  shape = 'rectangle',
  shapeProps = {},
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rc = rough.canvas(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set rough.js options
    const options = {
      roughness,
      stroke,
      strokeWidth,
      fill: fill !== 'transparent' ? fill : undefined,
      fillStyle: fill !== 'transparent' ? fillStyle : undefined,
      ...shapeProps,
    };

    // Draw shape based on type
    let drawable;
    switch (shape) {
      case 'rectangle':
        drawable = rc.rectangle(20, 20, width - 40, height - 40, options);
        break;
      case 'circle':
        drawable = rc.circle(width / 2, height / 2, Math.min(width, height) - 40, options);
        break;
      case 'ellipse':
        drawable = rc.ellipse(width / 2, height / 2, width - 40, height - 40, options);
        break;
      case 'line':
        drawable = rc.line(20, height / 2, width - 20, height / 2, options);
        break;
      default:
        drawable = rc.rectangle(20, 20, width - 40, height - 40, options);
    }

    // Apply GSAP animation based on type
    const tl = gsap.timeline({ delay });

    switch (animationType) {
      case 'draw':
        // Animate stroke dash for drawing effect
        tl.fromTo(container, {
          opacity: 0,
          scale: 0.8
        }, {
          opacity: 1,
          scale: 1,
          duration: duration * 0.3,
          ease: "back.out(1.7)"
        });
        break;

      case 'fade':
        tl.fromTo(container, {
          opacity: 0,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: duration,
          ease: "power2.out"
        });
        break;

      case 'scale':
        tl.fromTo(container, {
          scale: 0,
          rotation: -180
        }, {
          scale: 1,
          rotation: 0,
          duration: duration,
          ease: "back.out(1.7)"
        });
        break;

      case 'bounce':
        tl.fromTo(container, {
          y: -50,
          opacity: 0
        }, {
          y: 0,
          opacity: 1,
          duration: duration,
          ease: "bounce.out"
        });
        break;

      default:
        tl.fromTo(container, {
          opacity: 0
        }, {
          opacity: 1,
          duration: duration
        });
    }

    return () => {
      tl.kill();
    };
  }, [width, height, animationType, duration, delay, roughness, stroke, strokeWidth, fill, fillStyle, shape, shapeProps]);

  return (
    <div ref={containerRef} className={`rough-animated-shape ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
    </div>
  );
};

// Hook for creating animated rough annotations
export const useRoughAnnotation = () => {
  const annotate = (
    element: HTMLElement,
    type: 'underline' | 'highlight' | 'circle' | 'box' = 'underline',
    options: {
      color?: string;
      strokeWidth?: number;
      roughness?: number;
      animationDuration?: number;
      delay?: number;
    } = {}
  ) => {
    const {
      color = '#ff6b6b',
      strokeWidth = 2,
      roughness = 1,
      animationDuration = 1,
      delay = 0
    } = options;

    // Create annotation overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1000';

    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };

    overlay.style.left = `${rect.left - parentRect.left}px`;
    overlay.style.top = `${rect.top - parentRect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    element.parentElement?.appendChild(overlay);

    // Create canvas for rough drawing
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    overlay.appendChild(canvas);

    const rc = rough.canvas(canvas);

    // Animate based on type
    const tl = gsap.timeline({ delay });

    switch (type) {
      case 'underline':
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: animationDuration * 0.3 })
          .fromTo(overlay,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: animationDuration,
              transformOrigin: 'left center',
              ease: "power2.out"
            },
            0.1
          );
        // Draw underline
        setTimeout(() => {
          rc.line(0, rect.height - 5, rect.width, rect.height - 5, {
            roughness,
            stroke: color,
            strokeWidth
          });
        }, delay * 1000 + 100);
        break;

      case 'highlight':
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: animationDuration });
        // Draw highlight box
        setTimeout(() => {
          rc.rectangle(2, 2, rect.width - 4, rect.height - 4, {
            roughness,
            stroke: color,
            strokeWidth,
            fill: color,
            fillStyle: 'solid'
          });
        }, delay * 1000);
        break;

      case 'circle':
        tl.fromTo(overlay, { scale: 0, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: animationDuration,
          ease: "back.out(1.7)"
        });
        // Draw circle
        setTimeout(() => {
          rc.circle(rect.width / 2, rect.height / 2, Math.min(rect.width, rect.height) - 10, {
            roughness,
            stroke: color,
            strokeWidth
          });
        }, delay * 1000);
        break;

      case 'box':
        tl.fromTo(overlay, { scale: 0, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: animationDuration,
          ease: "back.out(1.7)"
        });
        // Draw box
        setTimeout(() => {
          rc.rectangle(5, 5, rect.width - 10, rect.height - 10, {
            roughness,
            stroke: color,
            strokeWidth
          });
        }, delay * 1000);
        break;
    }

    // Auto-remove after animation
    setTimeout(() => {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => overlay.remove()
      });
    }, (delay + animationDuration + 2) * 1000);

    return overlay;
  };

  return { annotate };
};