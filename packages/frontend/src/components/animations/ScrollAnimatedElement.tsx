import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  trigger?: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  className?: string;
}

export const ScrollAnimatedElement: React.FC<ScrollAnimatedElementProps> = ({
  children,
  animation = 'fadeIn',
  trigger,
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false,
  pin = false,
  markers = false,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state based on animation type
    let initialProps: any = {};
    let animateProps: any = {};

    switch (animation) {
      case 'fadeIn':
        initialProps = { opacity: 0 };
        animateProps = { opacity: 1 };
        break;
      case 'slideUp':
        initialProps = { opacity: 0, y: 50 };
        animateProps = { opacity: 1, y: 0 };
        break;
      case 'slideDown':
        initialProps = { opacity: 0, y: -50 };
        animateProps = { opacity: 1, y: 0 };
        break;
      case 'slideLeft':
        initialProps = { opacity: 0, x: 50 };
        animateProps = { opacity: 1, x: 0 };
        break;
      case 'slideRight':
        initialProps = { opacity: 0, x: -50 };
        animateProps = { opacity: 1, x: 0 };
        break;
      case 'scale':
        initialProps = { opacity: 0, scale: 0.8 };
        animateProps = { opacity: 1, scale: 1 };
        break;
      case 'rotate':
        initialProps = { opacity: 0, rotation: -10 };
        animateProps = { opacity: 1, rotation: 0 };
        break;
      default:
        initialProps = { opacity: 0 };
        animateProps = { opacity: 1 };
    }

    // Set initial state
    gsap.set(element, initialProps);

    // Create ScrollTrigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger || element,
        start,
        end,
        scrub,
        pin,
        markers,
        toggleActions: 'play none none reverse'
      }
    });

    tl.to(element, {
      ...animateProps,
      duration: 1,
      ease: 'power2.out'
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      tl.kill();
    };
  }, [animation, trigger, start, end, scrub, pin, markers]);

  return (
    <div ref={elementRef} className={`scroll-animated-element ${className}`}>
      {children}
    </div>
  );
};

// Hook for creating scroll-triggered animations
export const useScrollAnimation = () => {
  const createScrollTrigger = (
    element: HTMLElement | string,
    animation: {
      from?: any;
      to?: any;
      duration?: number;
      ease?: string;
    },
    trigger: {
      start?: string;
      end?: string;
      scrub?: boolean | number;
      pin?: boolean;
      markers?: boolean;
    } = {}
  ) => {
    const {
      from = { opacity: 0, y: 50 },
      to = { opacity: 1, y: 0 },
      duration = 1,
      ease = 'power2.out'
    } = animation;

    const {
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      pin = false,
      markers = false
    } = trigger;

    // Set initial state
    gsap.set(element, from);

    // Create animation
    gsap.to(element, {
      ...to,
      duration,
      ease,
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub,
        pin,
        markers,
        toggleActions: 'play none none reverse'
      }
    });
  };

  const createParallax = (
    element: HTMLElement,
    speed: number = 0.5,
    direction: 'up' | 'down' | 'left' | 'right' = 'up'
  ) => {
    const directionMap = {
      up: { y: -speed * 100 },
      down: { y: speed * 100 },
      left: { x: -speed * 100 },
      right: { x: speed * 100 }
    };

    gsap.to(element, {
      ...directionMap[direction],
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  };

  const createReveal = (
    element: HTMLElement,
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    distance: number = 50
  ) => {
    const directionMap = {
      up: { y: -distance },
      down: { y: distance },
      left: { x: -distance },
      right: { x: distance }
    };

    gsap.fromTo(element,
      {
        opacity: 0,
        ...directionMap[direction]
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  };

  return {
    createScrollTrigger,
    createParallax,
    createReveal
  };
};

// Component for animating game UI elements on scroll
export const GameScrollAnimator: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Animate game UI elements as they come into view
    const uiElements = container.querySelectorAll('.game-ui-element');

    uiElements.forEach((element, index) => {
      gsap.fromTo(element,
        {
          opacity: 0,
          y: 30,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: index * 0.1
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className={`game-scroll-animator ${className}`}>
      {children}
    </div>
  );
};