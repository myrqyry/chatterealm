import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  RoughAnimatedShape,
  ScrollAnimatedElement,
  RoughNotation,
  GameAchievement,
  GameObjective,
  GameHighlight,
  useRoughAnnotation,
  useScrollAnimation
} from './animations';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export const AnimationDemo: React.FC = () => {
  const [showAchievement, setShowAchievement] = useState(false);
  const [completedObjective, setCompletedObjective] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const { annotate } = useRoughAnnotation();
  const { createReveal } = useScrollAnimation();

  const handleAchievementClick = () => {
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3000);
  };

  const handleObjectiveClick = () => {
    setCompletedObjective(!completedObjective);
  };

  const handleAnnotationDemo = () => {
    const element = demoRef.current?.querySelector('.annotation-target');
    if (element) {
      annotate(element as HTMLElement, 'circle', {
        color: '#ff6b6b',
        strokeWidth: 3,
        animationDuration: 1000
      });
    }
  };

  const handleScrollReveal = () => {
    const elements = demoRef.current?.querySelectorAll('.reveal-target');
    elements?.forEach((el, index) => {
      createReveal(el as HTMLElement, 'up', 30);
    });
  };

  return (
    <div ref={demoRef} className="animation-demo p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">GSAP + Rough Animation Demo</h1>

      {/* Rough Animated Shapes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Rough Animated Shapes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RoughAnimatedShape
            shape="rectangle"
            animationType="draw"
            fill="#e0f2fe"
            fillStyle="hachure"
            stroke="#0369a1"
            width={150}
            height={100}
          />
          <RoughAnimatedShape
            shape="circle"
            animationType="bounce"
            fill="#fef3c7"
            fillStyle="cross-hatch"
            stroke="#d97706"
            width={120}
            height={120}
          />
          <RoughAnimatedShape
            shape="ellipse"
            animationType="scale"
            fill="#ecfdf5"
            fillStyle="dots"
            stroke="#059669"
            width={160}
            height={100}
          />
          <RoughAnimatedShape
            shape="line"
            animationType="fade"
            stroke="#dc2626"
            strokeWidth={4}
            width={140}
            height={80}
          />
        </div>
      </section>

      {/* Scroll Animations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Scroll Animations</h2>
        <div className="space-y-8">
          <ScrollAnimatedElement animation="fadeIn">
            <div className="bg-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-medium">Fade In Animation</h3>
              <p>This element fades in as you scroll.</p>
            </div>
          </ScrollAnimatedElement>

          <ScrollAnimatedElement animation="slideUp">
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-xl font-medium">Slide Up Animation</h3>
              <p>This element slides up from below as you scroll.</p>
            </div>
          </ScrollAnimatedElement>

          <ScrollAnimatedElement animation="slideLeft">
            <div className="bg-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-medium">Slide Left Animation</h3>
              <p>This element slides in from the left as you scroll.</p>
            </div>
          </ScrollAnimatedElement>

          <ScrollAnimatedElement animation="scale">
            <div className="bg-orange-100 p-6 rounded-lg">
              <h3 className="text-xl font-medium">Scale Animation</h3>
              <p>This element scales up as you scroll.</p>
            </div>
          </ScrollAnimatedElement>
        </div>
      </section>

      {/* Rough Notations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Rough Notations</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={handleAchievementClick}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Show Achievement
            </button>
            <div className="mt-2">
              <GameAchievement achieved={showAchievement}>
                🎉 Level Up! You reached level 5!
              </GameAchievement>
            </div>
          </div>

          <div>
            <button
              onClick={handleObjectiveClick}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Toggle Objective
            </button>
            <div className="mt-2">
              <GameObjective completed={completedObjective}>
                {completedObjective ? "✅ Defeat the dragon" : "⚔️ Defeat the dragon"}
              </GameObjective>
            </div>
          </div>

          <div className="space-y-2">
            <GameHighlight type="important" trigger="hover">
              ⚠️ Critical Warning: Low Health!
            </GameHighlight>

            <GameHighlight type="success" trigger="hover">
              ✅ Quest Completed Successfully!
            </GameHighlight>

            <GameHighlight type="info" trigger="hover">
              ℹ️ New tutorial available in the menu.
            </GameHighlight>
          </div>
        </div>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Interactive Demos</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={handleAnnotationDemo}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Annotate Element
            </button>
            <p className="annotation-target mt-2 p-4 bg-gray-100 rounded">
              This text can be annotated with rough circles!
            </p>
          </div>

          <div>
            <button
              onClick={handleScrollReveal}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Reveal Elements
            </button>
            <div className="space-y-4 mt-4">
              <div className="reveal-target p-4 bg-red-100 rounded opacity-0">
                Element 1 - Will slide up
              </div>
              <div className="reveal-target p-4 bg-yellow-100 rounded opacity-0">
                Element 2 - Will slide up
              </div>
              <div className="reveal-target p-4 bg-pink-100 rounded opacity-0">
                Element 3 - Will slide up
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game UI Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Game UI Integration</h2>
        <div className="bg-gray-900 text-white p-6 rounded-lg">
          <h3 className="text-xl font-medium mb-4">Game HUD</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="game-ui-element bg-red-600 p-3 rounded text-center">
              ❤️ Health: 85/100
            </div>
            <div className="game-ui-element bg-blue-600 p-3 rounded text-center">
              ⚡ Mana: 60/100
            </div>
            <div className="game-ui-element bg-yellow-600 p-3 rounded text-center">
              🪙 Gold: 1,250
            </div>
            <div className="game-ui-element bg-green-600 p-3 rounded text-center">
              ⭐ XP: 2,340
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};