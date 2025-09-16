import React from 'react';
import DevLayout from './DevLayout';

const DevRouteWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <DevLayout>
      {/* DevLayout wasn't originally accepting children; this wrapper will just render children below the header */}
      <div style={{ position: 'absolute', top: 120, left: 24, right: 24, bottom: 24, overflow: 'auto', zIndex: 1100 }}>
        {children}
      </div>
    </DevLayout>
  );
};

export default DevRouteWrapper;
