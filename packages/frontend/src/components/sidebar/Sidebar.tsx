import React from 'react';
import PlayerSidebar from './PlayerSidebar.tsx';
import SpectatorSidebar from './SpectatorSidebar.tsx';
import DevSidebar from './DevSidebar.tsx';

export interface SidebarProps {
  mode: 'play' | 'spectate' | 'dev';
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ mode, className }) => {
  switch (mode) {
    case 'play':
      return <PlayerSidebar className={className} />;
    case 'spectate':
      return <SpectatorSidebar className={className} />;
    case 'dev':
      return <DevSidebar className={className} />;
    default:
      return null;
  }
};

export default Sidebar;
