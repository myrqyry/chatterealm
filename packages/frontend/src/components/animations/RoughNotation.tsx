import React, { useRef, useEffect } from 'react';
import { annotate } from 'rough-notation';
import { gsap } from 'gsap';

interface RoughNotationProps {
  children: React.ReactNode;
  type?: 'underline' | 'box' | 'circle' | 'highlight' | 'strike-through' | 'crossed-off';
  color?: string;
  strokeWidth?: number;
  padding?: number;
  iterations?: number;
  animationDuration?: number;
  animationDelay?: number;
  multiline?: boolean;
  className?: string;
  trigger?: 'hover' | 'click' | 'scroll' | 'manual';
  show?: boolean;
}

export const RoughNotation: React.FC<RoughNotationProps> = ({
  children,
  type = 'underline',
  color = '#ff6b6b',
  strokeWidth = 2,
  padding = 5,
  iterations = 2,
  animationDuration = 800,
  animationDelay = 0,
  multiline = false,
  className = '',
  trigger = 'manual',
  show = false,
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const annotationRef = useRef<any>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create annotation
    annotationRef.current = annotate(element, {
      type,
      color,
      strokeWidth,
      padding,
      iterations,
      animationDuration,
      multiline,
    });

    // Set up trigger behavior
    const handleTrigger = () => {
      if (annotationRef.current) {
        annotationRef.current.show();
      }
    };

    const handleHide = () => {
      if (annotationRef.current) {
        annotationRef.current.hide();
      }
    };

    switch (trigger) {
      case 'hover':
        element.addEventListener('mouseenter', handleTrigger);
        element.addEventListener('mouseleave', handleHide);
        break;
      case 'click':
        element.addEventListener('click', handleTrigger);
        break;
      case 'scroll':
        // Use GSAP ScrollTrigger for scroll-based annotation
        gsap.registerPlugin(require('gsap/ScrollTrigger'));
        gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            onEnter: handleTrigger,
            onLeaveBack: handleHide
          }
        });
        break;
      case 'manual':
        if (show) {
          handleTrigger();
        }
        break;
    }

    return () => {
      element.removeEventListener('mouseenter', handleTrigger);
      element.removeEventListener('mouseleave', handleHide);
      element.removeEventListener('click', handleTrigger);
      if (annotationRef.current) {
        annotationRef.current.hide();
      }
    };
  }, [type, color, strokeWidth, padding, iterations, animationDuration, animationDelay, multiline, trigger, show]);

  return (
    <span
      ref={elementRef}
      className={`rough-notation ${className}`}
      style={{ cursor: trigger === 'click' ? 'pointer' : 'inherit' }}
    >
      {children}
    </span>
  );
};

// Hook for programmatic rough notation control
export const useRoughNotation = () => {
  const annotationsRef = useRef<Map<string, any>>(new Map());

  const createAnnotation = (
    element: HTMLElement,
    id: string,
    options: {
      type: 'underline' | 'box' | 'circle' | 'highlight' | 'strike-through' | 'crossed-off';
      color?: string;
      strokeWidth?: number;
      padding?: number;
      iterations?: number;
      animationDuration?: number;
      multiline?: boolean;
    } = {} as any
  ) => {
    const annotation = annotate(element, options);
    annotationsRef.current.set(id, annotation);
    return annotation;
  };

  const show = (id: string) => {
    const annotation = annotationsRef.current.get(id);
    if (annotation) {
      annotation.show();
    }
  };

  const hide = (id: string) => {
    const annotation = annotationsRef.current.get(id);
    if (annotation) {
      annotation.hide();
    }
  };

  const remove = (id: string) => {
    const annotation = annotationsRef.current.get(id);
    if (annotation) {
      annotation.hide();
      annotationsRef.current.delete(id);
    }
  };

  const animateSequence = (
    elements: Array<{ element: HTMLElement; id: string; options?: any; delay?: number }>
  ) => {
    const tl = gsap.timeline();

    elements.forEach(({ element, id, options = {}, delay = 0 }, index) => {
      const annotation = createAnnotation(element, id, options);

      tl.call(() => annotation.show(), [], delay + index * 0.5);
    });

    return tl;
  };

  return {
    createAnnotation,
    show,
    hide,
    remove,
    animateSequence
  };
};

// Game-specific annotation components
export const GameAchievement: React.FC<{
  children: React.ReactNode;
  achieved?: boolean;
  className?: string;
}> = ({ children, achieved = false, className = '' }) => {
  return (
    <RoughNotation
      type="highlight"
      color={achieved ? "#4ade80" : "#f59e0b"}
      animationDuration={1000}
      trigger="manual"
      show={achieved}
      className={`game-achievement ${className}`}
    >
      {children}
    </RoughNotation>
  );
};

export const GameObjective: React.FC<{
  children: React.ReactNode;
  completed?: boolean;
  className?: string;
}> = ({ children, completed = false, className = '' }) => {
  return (
    <RoughNotation
      type={completed ? "strike-through" : "underline"}
      color={completed ? "#10b981" : "#3b82f6"}
      animationDuration={800}
      trigger="manual"
      show={true}
      className={`game-objective ${className}`}
    >
      {children}
    </RoughNotation>
  );
};

export const GameHighlight: React.FC<{
  children: React.ReactNode;
  type?: 'important' | 'warning' | 'success' | 'info';
  trigger?: 'hover' | 'click' | 'scroll';
  className?: string;
}> = ({ children, type = 'important', trigger = 'hover', className = '' }) => {
  const colors = {
    important: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6'
  };

  return (
    <RoughNotation
      type="box"
      color={colors[type]}
      strokeWidth={3}
      padding={8}
      animationDuration={600}
      trigger={trigger}
      className={`game-highlight game-highlight-${type} ${className}`}
    >
      {children}
    </RoughNotation>
  );
};