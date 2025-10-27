// packages/frontend/src/services/LayoutManagerService.ts
import { Layout } from 'react-grid-layout';

const LAYOUT_STORAGE_KEY = 'chatter-realm-layout';

class LayoutManagerService {
  private layouts: Map<string, { [key: string]: Layout[] }> = new Map();

  constructor() {
    this.loadLayouts();
    if (!this.layouts.has('default')) {
      // Register a default layout if none is loaded
      this.layouts.set('default', {
          lg: [
              { i: 'main-content', x: 0, y: 0, w: 8, h: 10, static: false },
              { i: 'chat', x: 8, y: 0, w: 4, h: 5, static: false },
              { i: 'friends', x: 8, y: 5, w: 4, h: 5, static: false },
          ]
      });
    }
  }

  getLayout(id: string): { [key: string]: Layout[] } | undefined {
    return this.layouts.get(id);
  }

  updateLayout(id: string, newLayouts: { [key: string]: Layout[] }) {
    this.layouts.set(id, newLayouts);
    this.saveLayouts();
  }

  private saveLayouts() {
    try {
      const layoutsJson = JSON.stringify(Array.from(this.layouts.entries()));
      localStorage.setItem(LAYOUT_STORAGE_KEY, layoutsJson);
    } catch (error) {
      console.error("Failed to save layout to localStorage", error);
    }
  }

  private loadLayouts() {
    try {
      const layoutsJson = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (layoutsJson) {
        this.layouts = new Map(JSON.parse(layoutsJson));
      }
    } catch (error) {
      console.error("Failed to load layout from localStorage", error);
      this.layouts = new Map();
    }
  }
}

export const layoutManagerService = new LayoutManagerService();
