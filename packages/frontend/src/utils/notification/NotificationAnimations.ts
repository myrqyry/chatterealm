import { gsap } from 'gsap';

export const slideInNotification = (
  element: HTMLElement, 
  onComplete?: () => void
) => {
  gsap.fromTo(element, 
    { x: 300, opacity: 0, scale: 0.8 },
    { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      onComplete: onComplete
    }
  );
};

export const slideOutNotification = (
  element: HTMLElement, 
  onComplete?: () => void
) => {
  gsap.to(element, {
    x: 300,
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "back.in(1.7)",
    onComplete: onComplete
  });
};

export const animateProgressBar = (
  progressElement: HTMLElement, 
  durationSeconds: number, 
  onComplete?: () => void
) => {
  gsap.fromTo(progressElement,
    { width: '100%' },
    {
      width: '0%',
      duration: durationSeconds,
      ease: "none",
      onComplete: onComplete
    }
  );
};