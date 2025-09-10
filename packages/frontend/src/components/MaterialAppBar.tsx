import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

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
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(25, 23, 36, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
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
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontFamily: 'JetBrains Mono',
            fontWeight: 600,
            fontSize: '1.1rem'
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
