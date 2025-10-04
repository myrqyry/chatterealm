import React, { useRef, useEffect } from 'react';
import { annotate } from 'rough-notation';
import type { Annotation } from 'rough-notation/lib/model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const annotationRef = useRef<Annotation | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const annotation = annotate(element, {
      type,
      color,
      strokeWidth,
      padding,
      iterations,
      animationDuration,
      multiline,
    });
    annotationRef.current = annotation;

    const ctx = gsap.context(() => {
      const handleTrigger = () => annotation.show();
      const handleHide = () => annotation.hide();

      if (trigger === 'scroll') {
        ScrollTrigger.create({
          trigger: element,
          start: 'top 80%',
          onEnter: handleTrigger,
          onLeaveBack: handleHide,
          onLeave: handleHide,
        });
      } else if (trigger === 'hover') {
        element.addEventListener('mouseenter', handleTrigger);
        element.addEventListener('mouseleave', handleHide);
      } else if (trigger === 'click') {
        element.addEventListener('click', handleTrigger);
      }
      
      return () => {
        element.removeEventListener('mouseenter', handleTrigger);
        element.removeEventListener('mouseleave', handleHide);
        element.removeEventListener('click', handleTrigger);
      };
    }, elementRef);

    return () => {
      ctx.revert();
      annotation.remove();
    };
  }, [type, color, strokeWidth, padding, iterations, animationDuration, multiline, trigger]);

  useEffect(() => {
    if (trigger === 'manual' && annotationRef.current) {
      if (show) {
        annotationRef.current.show();
      } else {
        annotationRef.current.hide();
      }
    }
  }, [show, trigger]);

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
  const annotationsRef = useRef<Map<string, Annotation>>(new Map());

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      annotationsRef.current.forEach(annotation => annotation.remove());
    };
  }, []);

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
    annotationsRef.current.get(id)?.show();
  };

  const hide = (id: string) => {
    annotationsRef.current.get(id)?.hide();
  };

  const remove = (id: string) => {
    const annotation = annotationsRef.current.get(id);
    if (annotation) {
      annotation.remove();
      annotationsRef.current.delete(id);
    }
  };

  const animateSequence = (
    elements: Array<{ element: HTMLElement; id: string; options?: any; delay?: number }>
  ) => {
    const tl = gsap.timeline();
    const createdAnnotations: Annotation[] = [];

    elements.forEach(({ element, id, options = {}, delay = 0 }, index) => {
      const annotation = createAnnotation(element, id, options);
      createdAnnotations.push(annotation);
      tl.call(() => annotation.show(), [], delay + index * 0.5);
    });

    // Add a cleanup for the timeline
    tl.eventCallback('onReverseComplete', () => {
      createdAnnotations.forEach(ann => ann.remove());
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