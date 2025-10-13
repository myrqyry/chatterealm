import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface MaterialChipProps extends ChipProps {
  variant?: 'filled' | 'outlined';
}

const MaterialChip: React.FC<MaterialChipProps> = ({
  variant = 'filled',
  sx = {},
  ...props
}) => {
  return (
    <Chip
      variant={variant}
      sx={{
        fontFamily: 'JetBrains Mono',
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        borderRadius: 1,
        '& .MuiChip-label': {
          px: 1,
        },
        ...sx
      }}
      {...props}
    />
  );
};

export default MaterialChip;
