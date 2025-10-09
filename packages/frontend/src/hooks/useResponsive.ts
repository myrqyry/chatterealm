import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/designSystem';

const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < BREAKPOINTS.tablet);
      setIsTablet(width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop);
      setIsDesktop(width >= BREAKPOINTS.desktop);
    };

    handleResize(); // Set initial values
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile, isTablet, isDesktop };
};

export default useResponsive;