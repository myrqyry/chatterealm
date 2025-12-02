import { describe, it, expect, beforeEach } from 'vitest';
import { renderStoreHook } from '@/test/utils';
import { useLayoutStore } from './layoutStore';

describe('Layout Store', () => {
  beforeEach(() => {
    // Clear any existing store state before each test
    const { result } = renderStoreHook(useLayoutStore);
    const { setLayouts } = result.current;

    // Reset to default layouts
    setLayouts({
      lg: [
        { i: 'main-content', x: 0, y: 0, w: 8, h: 10, static: false },
        { i: 'chat', x: 8, y: 0, w: 4, h: 5, static: false },
        { i: 'friends', x: 8, y: 5, w: 4, h: 5, static: false },
      ],
    });
  });

  describe('Initial State', () => {
    it('should initialize with default layouts', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { layouts } = result.current;

      expect(layouts).toEqual({
        lg: [
          { i: 'main-content', x: 0, y: 0, w: 8, h: 10, static: false },
          { i: 'chat', x: 8, y: 0, w: 4, h: 5, static: false },
          { i: 'friends', x: 8, y: 5, w: 4, h: 5, static: false },
        ],
      });
    });
  });

  describe('Layout Management', () => {
    it('should update layouts when setLayouts is called', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { layouts, setLayouts } = result.current;

      const newLayouts = {
        lg: [
          { i: 'main-content', x: 0, y: 0, w: 12, h: 12, static: false },
        ],
      };

      setLayouts(newLayouts);

      const updatedResult = renderStoreHook(useLayoutStore);
      expect(updatedResult.result.current.layouts).toEqual(newLayouts);
    });

    it('should handle empty layouts', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { setLayouts } = result.current;

      expect(() => {
        setLayouts({});
      }).not.toThrow();
    });

    it('should preserve layout structure when updating', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { layouts, setLayouts } = result.current;

      const updatedLayouts = {
        lg: [
          ...layouts.lg,
          { i: 'new-panel', x: 12, y: 0, w: 3, h: 6, static: false },
        ],
      };

      setLayouts(updatedLayouts);

      const { result: updatedResult } = renderStoreHook(useLayoutStore);
      expect(updatedResult.result.current.layouts.lg.length).toBe(4);
      expect(updatedResult.result.current.layouts.lg[3].i).toBe('new-panel');
    });
  });

  describe('Layout Validation', () => {
    it('should handle layouts with missing required fields', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { setLayouts } = result.current;

      const incompleteLayouts = {
        lg: [
          { i: 'incomplete', x: 0, y: 0 }, // Missing w, h, static
        ],
      };

      expect(() => {
        setLayouts(incompleteLayouts);
      }).not.toThrow();
    });

    it('should handle layouts with null values', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { setLayouts } = result.current;

      const layoutsWithNull = {
        lg: [
          { i: 'null-layout', x: null, y: null, w: null, h: null, static: null },
        ],
      };

      expect(() => {
        setLayouts(layoutsWithNull);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid layout updates', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { setLayouts } = result.current;

      for (let i = 0; i < 10; i++) {
        setLayouts({
          lg: [
            { i: `panel-${i}`, x: 0, y: 0, w: 6, h: 6, static: false },
          ],
        });
      }

      // Should not crash or throw errors
      expect(true).toBe(true);
    });

    it('should handle complex nested layout structures', () => {
      const { result } = renderStoreHook(useLayoutStore);
      const { setLayouts } = result.current;

      const complexLayouts = {
        lg: [
          { i: 'main', x: 0, y: 0, w: 8, h: 8, static: false, minW: 4, maxW: 12 },
          { i: 'sidebar', x: 8, y: 0, w: 4, h: 4, static: false, isResizable: true },
          { i: 'footer', x: 0, y: 8, w: 12, h: 2, static: true, isDraggable: false },
        ],
        md: [
          { i: 'main', x: 0, y: 0, w: 6, h: 6, static: false },
          { i: 'sidebar', x: 6, y: 0, w: 3, h: 3, static: false },
        ],
      };

      expect(() => {
        setLayouts(complexLayouts);
      }).not.toThrow();
    });
  });
});