import React from 'react';
import { MaterialChip, MaterialPaper } from '../index';
import { Z_INDEX, TYPOGRAPHY, COMMON_STYLES } from '../../utils/designSystem';

interface GameLegendProps {
  position?: 'bottom' | 'top' | 'left' | 'right';
  className?: string;
}

const GameLegend: React.FC<GameLegendProps> = ({
  position = 'bottom',
  className = ''
}) => {
  const legendItems = [
    { label: 'Knight', color: 'var(--color-legend-knight)' },
    { label: 'Rogue', color: 'var(--color-legend-rogue)' },
    { label: 'Mage', color: 'var(--color-legend-mage)' },
    { label: 'NPC', color: 'var(--color-legend-npc)' },
    { label: 'Item', color: 'var(--color-legend-item)' },
  ];

  const positionStyles = {
    bottom: {
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    top: {
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      top: '50%',
      left: '20px',
      transform: 'translateY(-50%)',
    },
    right: {
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
    },
  };

  return (
    <MaterialPaper
      className={`game-legend ${className}`}
      sx={{
        position: 'absolute',
        display: 'flex',
        gap: 1,
        p: 1,
        zIndex: Z_INDEX.fixed,
        ...COMMON_STYLES.glass,
        ...positionStyles[position],
      }}
    >
      {legendItems.map((item) => (
        <MaterialChip
          key={item.label}
          label={item.label}
          size="small"
          sx={{
            backgroundColor: item.color,
            color: 'white',
            fontSize: TYPOGRAPHY.fontSize.xs,
            height: '20px',
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      ))}
    </MaterialPaper>
  );
};

export default GameLegend;