// packages/frontend/src/services/LayoutManagerService.ts
import { Layouts } from 'react-grid-layout';
import { useLayoutStore } from '../stores/layoutStore';

const LAYOUT_STORAGE_KEY = 'chatter-realm-layout';

class LayoutManagerService {
  constructor() {
    this.loadLayout();

    // Subscribe to the store to save changes to localStorage
    useLayoutStore.subscribe(
      (state) => this.saveLayout(state.layouts)
    );
  }

  private saveLayout(layouts: Layouts) {
    try {
      const layoutsJson = JSON.stringify(layouts);
      localStorage.setItem(LAYOUT_STORAGE_KEY, layoutsJson);
    } catch (error) {
      console.error("Failed to save layout to localStorage", error);
    }
  }

  private loadLayout() {
    try {
      const layoutsJson = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (layoutsJson) {
        const loadedLayouts = JSON.parse(layoutsJson);
        // Initialize the store with the loaded layout
        useLayoutStore.getState().setLayouts(loadedLayouts);
      }
    } catch (error) {
      console.error("Failed to load layout from localStorage", error);
    }
  }
}

// Initialize the service to set up the persistence logic
export const layoutManagerService = new LayoutManagerService();
