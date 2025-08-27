import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

interface BreakpointInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export const useResponsive = (): BreakpointInfo => {
  const [breakpoint, setBreakpoint] = useState<BreakpointInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1200
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width
      });
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className={`responsive-layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;