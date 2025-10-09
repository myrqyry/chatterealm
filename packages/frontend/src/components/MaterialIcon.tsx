import React from 'react';
import Icon from '@mui/material/Icon';
import { SxProps, Theme } from '@mui/material/styles';

interface MaterialIconProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ children, sx }) => {
  return (
    <Icon sx={{ color: 'var(--color-text-primary)', ...sx }}>
      {children}
    </Icon>
  );
};

export default MaterialIcon;