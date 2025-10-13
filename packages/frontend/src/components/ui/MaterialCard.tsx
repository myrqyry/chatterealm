import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box } from '@mui/material';

interface MaterialCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  elevation?: number;
  sx?: any;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  title,
  subtitle,
  children,
  elevation = 1,
  sx = {}
}) => {
  return (
    <Card
      elevation={elevation}
      sx={{
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...sx
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title && (
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'JetBrains Mono',
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'JetBrains Mono',
                color: 'text.secondary'
              }}
            >
              {subtitle}
            </Typography>
          )}
          sx={{ pb: 1 }}
        />
      )}
      <CardContent sx={{ pt: title || subtitle ? 0 : 2 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
