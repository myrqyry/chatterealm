import { useState, useEffect, useRef } from 'react';

interface ContainerSize {
  width: number;
  height: number;
}

export const useContainerResize = (containerRef: React.RefObject<HTMLDivElement>): ContainerSize => {
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [containerRef]);

  return containerSize;
};
