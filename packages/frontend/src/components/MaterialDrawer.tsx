import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface MaterialDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  width?: number;
}

const MaterialDrawer: React.FC<MaterialDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 300
}) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: width,
          backgroundColor: 'background.paper',
          backgroundImage: 'none',
          borderRight: '1px solid',
          borderRightColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title && (
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'JetBrains Mono',
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
        )}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Drawer>
  );
};

export default MaterialDrawer;
