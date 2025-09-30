import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface MaterialGroupProps {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  elevation?: number;
}

const MaterialGroup: React.FC<MaterialGroupProps> = ({
  title,
  icon,
  children,
  elevation = 1,
}) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon && (
            <Box sx={{ fontSize: '1.5em', lineHeight: 1 }}>
              {icon}
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'JetBrains Mono',
              fontWeight: 600,
              color: 'text.primary',
              mb: 0,
            }}
          >
            {title}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </Box>
    </Paper>
  );
};

export default MaterialGroup;
