import React from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useLayoutStore } from '../../stores/layoutStore';
import ChatPanel from '../panels/ChatPanel';
import FriendsPanel from '../panels/FriendsPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

// A simple Panel component for demonstration
const Panel: React.FC<{ title: string, children?: React.ReactNode }> = ({ title, children }) => (
  <div style={{ border: '1px solid #ccc', borderRadius: '4px', height: '100%', overflow: 'auto', background: 'white' }}>
    <div style={{ background: '#f0f0f0', padding: '8px', fontWeight: 'bold', cursor: 'move' }}>{title}</div>
    <div style={{ padding: '8px' }}>{children}</div>
  </div>
);

// Component registry
const panelRegistry: { [key: string]: React.ComponentType } = {
  chat: ChatPanel,
  friends: FriendsPanel,
};

const PanelSystem: React.FC = ({ children }) => {
  const { layouts, setLayouts } = useLayoutStore();

  const onLayoutChange = (newLayout: Layout[], newLayouts: Layouts) => {
    setLayouts(newLayouts);
  };

  const generatePanels = () => {
    // We'll use the 'lg' breakpoint as the source of truth for which panels to render.
    const layout = layouts?.lg;
    if (!layout) return null;

    return layout.map((panel) => {
      const PanelComponent = panelRegistry[panel.i];
      const panelContent = panel.i === 'main-content'
        ? children
        : PanelComponent ? <PanelComponent /> : `Unknown panel: ${panel.i}`;

      return (
        <div key={panel.i}>
          <Panel title={panel.i}>{panelContent}</Panel>
        </div>
      );
    });
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={30}
      onLayoutChange={onLayoutChange}
    >
      {generatePanels()}
    </ResponsiveGridLayout>
  );
};

export default PanelSystem;
