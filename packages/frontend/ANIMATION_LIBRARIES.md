# Animation Libraries Integration

This project now includes advanced animation capabilities using GSAP and Rough.js libraries.

## Libraries Added

### 1. GSAP (GreenSock Animation Platform)
- **Already installed**: `gsap@^3.13.0`
- Used for: Notification animations, complex UI transitions
- Features: Timeline control, easing functions, scroll triggers

### 2. Rough Notation
- **Newly added**: Modern alternative to Khan Academy's Khannotations
- Used for: Hand-drawn style annotations and highlights
- Features: Underlines, boxes, circles, highlights with rough edges

## New Components

### RoughAnimatedShape
Creates animated rough.js shapes with GSAP animations.

```tsx
import { RoughAnimatedShape } from './components/animations';

<RoughAnimatedShape
  shape="circle"
  animationType="bounce"
  fill="#fef3c7"
  fillStyle="cross-hatch"
  stroke="#d97706"
  width={120}
  height={120}
/>
```

**Props:**
- `shape`: 'rectangle' | 'circle' | 'ellipse' | 'line'
- `animationType`: 'draw' | 'fade' | 'scale' | 'bounce'
- `fill`, `stroke`, `fillStyle`: Rough.js styling options
- `width`, `height`: Canvas dimensions

### ScrollAnimatedElement
GSAP ScrollTrigger-powered scroll animations.

```tsx
import { ScrollAnimatedElement } from './components/animations';

<ScrollAnimatedElement animation="slideUp" start="top 80%">
  <div>Content that animates on scroll</div>
</ScrollAnimatedElement>
```

**Props:**
- `animation`: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate'
- `start`, `end`: Scroll trigger positions
- `scrub`: Smooth scrubbing boolean/number
- `pin`: Pin element during animation

### RoughNotation
Hand-drawn style annotations.

```tsx
import { RoughNotation, GameAchievement, GameObjective } from './components/animations';

// Basic usage
<RoughNotation type="underline" color="#ff6b6b" trigger="hover">
  Important text
</RoughNotation>

// Game-specific components
<GameAchievement achieved={true}>
  🎉 Level Up!
</GameAchievement>

<GameObjective completed={false}>
  ⚔️ Defeat the dragon
</GameObjective>
```

**Props:**
- `type`: 'underline' | 'box' | 'circle' | 'highlight' | 'strike-through' | 'crossed-off'
- `trigger`: 'hover' | 'click' | 'scroll' | 'manual'
- `color`, `strokeWidth`, `animationDuration`: Styling options

## Hooks

### useRoughAnnotation
Programmatic control over rough annotations.

```tsx
const { annotate } = useRoughAnnotation();

// Annotate an element
const element = document.getElementById('target');
annotate(element, 'circle', {
  color: '#ff6b6b',
  strokeWidth: 3,
  animationDuration: 1000
});
```

### useScrollAnimation
Create scroll-triggered animations programmatically.

```tsx
const { createReveal, createParallax } = useScrollAnimation();

// Reveal animation
createReveal(element, 'up', 50);

// Parallax effect
createParallax(element, 0.5, 'up');
```

## Demo

Visit `/animations` route to see all animation components in action.

## Integration Examples

### Enhanced Game UI
```tsx
// Animated achievement notifications
<GameAchievement achieved={playerLeveledUp}>
  🎉 Reached Level {playerLevel}!
</GameAchievement>

// Scroll-revealing quest objectives
<ScrollAnimatedElement animation="slideUp">
  <GameObjective completed={questDone}>
    {questDone ? "✅" : "⚔️"} {questText}
  </GameObjective>
</ScrollAnimatedElement>

// Rough-animated game elements
<RoughAnimatedShape
  shape="circle"
  animationType="scale"
  fill="#4ade80"
  className="health-indicator"
/>
```

### Interactive Annotations
```tsx
// Highlight important game elements
<GameHighlight type="warning" trigger="hover">
  ⚠️ Boss approaching!
</GameHighlight>

// Clickable tutorial hints
<RoughNotation type="box" trigger="click" color="#3b82f6">
  💡 Click here for help
</RoughNotation>
```

## Performance Notes

- GSAP animations are GPU-accelerated when possible
- Rough.js generates SVG/Canvas elements - monitor DOM size
- ScrollTrigger animations are cleaned up automatically
- Use `game-ui-element` class for scroll-animated game UI

## Browser Support

- GSAP: All modern browsers + IE9+
- Rough Notation: Modern browsers with ES6 support
- ScrollTrigger: Requires IntersectionObserver support

## Migration from Existing Animations

The new animation system complements existing CSS animations and Rough.js usage:

- **Keep CSS animations** for simple transitions
- **Use GSAP** for complex sequences and scroll animations
- **Use Rough Notation** for hand-drawn style highlights
- **Use RoughAnimatedShape** for animated rough graphics