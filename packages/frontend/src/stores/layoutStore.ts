// packages/frontend/src/stores/layoutStore.ts
import { create } from 'zustand';
import { Layouts } from 'react-grid-layout';

interface LayoutState {
  layouts: Layouts;
  setLayouts: (layouts: Layouts) => void;
}

const defaultLayouts: Layouts = {
  lg: [
    { i: 'main-content', x: 0, y: 0, w: 8, h: 10, static: false },
    { i: 'chat', x: 8, y: 0, w: 4, h: 5, static: false },
    { i: 'friends', x: 8, y: 5, w: 4, h: 5, static: false },
  ],
};

export const useLayoutStore = create<LayoutState>((set) => ({
  layouts: defaultLayouts,
  setLayouts: (newLayouts) => set({ layouts: newLayouts }),
}));
