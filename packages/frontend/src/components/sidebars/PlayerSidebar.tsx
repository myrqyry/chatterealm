import React from 'react';
import UnifiedSettingsMenuModal from '../UnifiedSettingsMenuModal';

interface PlayerSidebarProps {
  className?: string;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ className }) => {
  return (
    <div className={className}>
      <UnifiedSettingsMenuModal />
    </div>
  );
};

export default PlayerSidebar;