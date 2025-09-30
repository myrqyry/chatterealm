import React from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

interface MaterialTooltipProps extends TooltipProps {
  title: string;
}

const MaterialTooltip: React.FC<MaterialTooltipProps> = ({
  title,
  children,
  sx = {},
  ...props
}) => {
  return (
    <Tooltip
      title={title}
      sx={{
        '& .MuiTooltip-tooltip': {
          backgroundColor: 'rgba(25, 23, 36, 0.95)',
          color: 'text.primary',
          fontSize: '0.75rem',
          fontFamily: 'JetBrains Mono',
          borderRadius: 1,
          padding: '8px 12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          border: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
        },
        '& .MuiTooltip-arrow': {
          color: 'rgba(25, 23, 36, 0.95)',
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default MaterialTooltip;
