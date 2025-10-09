import React from 'react';
import AppHeader from './AppHeader';
import GameLegend from './GameLegend';
import { LAYOUT, COMMON_STYLES, Z_INDEX, BREAKPOINTS } from '../../utils/designSystem';
import useResponsive from '../../hooks/useResponsive'; // Import the new hook

interface BaseLayoutProps {
  mode: 'play' | 'spectate' | 'dev';
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'top' | 'left' | 'right';
  headerContent?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  mode,
  showLegend = true,
  legendPosition = 'bottom',
  headerContent,
  sidebar,
  children,
  className = '',
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getSidebarWidth = () => {
    if (isMobile) return LAYOUT.sidebarWidth.sm;
    if (isTablet) return LAYOUT.sidebarWidth.md;
    return LAYOUT.sidebarWidth.lg;
  };

  const getGameCanvasMaxWidth = () => {
    if (sidebar) {
      if (isMobile) return `calc(100vw - ${LAYOUT.sidebarWidth.sm})`;
      if (isTablet) return `calc(100vw - ${LAYOUT.sidebarWidth.md})`;
      return LAYOUT.gameCanvas.maxWidth; // Use default for desktop
    }
    return '100vw';
  };

  return (
    <div
      className={`base-layout ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        padding: 0,
        margin: 0,
        background: 'var(--color-background-primary)',
        fontFamily: 'var(--font-family-primary)',
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <AppHeader mode={mode}>
        {headerContent}
      </AppHeader>

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile
        }}
      >
        {/* Primary Content */}
        <main
          style={{
            flex: 1,
            background: 'var(--color-surface)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Game Content Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              maxWidth: getGameCanvasMaxWidth(),
              maxHeight: '100vh',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {children}
          </div>

          {/* Game Legend */}
          {showLegend && (
            <GameLegend position={isMobile ? 'bottom' : legendPosition} /> {/* Adjust legend position on mobile */}
          )}
        </main>

        {/* Sidebar */}
        {sidebar && (
          <aside
            style={{
              width: isMobile ? '100%' : getSidebarWidth(), // Full width on mobile, dynamic on others
              height: isMobile ? LAYOUT.sidebarHeight.mobile : 'auto', // Fixed height on mobile
              background: 'var(--color-surface-variant)',
              borderLeft: isMobile ? 'none' : '1px solid var(--color-outline)',
              borderTop: isMobile ? '1px solid var(--color-outline)' : 'none', // Top border on mobile
              overflow: 'auto',
              order: isMobile ? 1 : 0, // Order sidebar below main content on mobile
            }}
          >
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
};

export default BaseLayout;