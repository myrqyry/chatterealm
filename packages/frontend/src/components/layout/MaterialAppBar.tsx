import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Z_INDEX, COMMON_STYLES, TYPOGRAPHY, SPACING } from '../../utils/designSystem';

interface MaterialAppBarProps {
  title?: string;
  onMenuClick?: () => void;
  children?: React.ReactNode;
  sx?: any;
}

const MaterialAppBar: React.FC<MaterialAppBarProps> = ({
  title = "🗺️ Chat Grid Chronicles",
  onMenuClick,
  children,
  sx = {}
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: Z_INDEX.appBar,
        backgroundColor: COMMON_STYLES.glass.background,
        backdropFilter: COMMON_STYLES.glass.backdropFilter,
        borderBottom: COMMON_STYLES.glass.border,
        borderBottomColor: 'divider',
        ...sx
      }}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: SPACING.md }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontFamily: TYPOGRAPHY.fontFamily.code,
            fontWeight: TYPOGRAPHY.fontWeight.semibold,
            fontSize: TYPOGRAPHY.fontSize.lg
          }}
        >
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default MaterialAppBar;