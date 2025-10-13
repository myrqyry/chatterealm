import React from 'react';
import { Paper, PaperProps } from '@mui/material';

interface MaterialPaperProps extends PaperProps {
  children: React.ReactNode;
}

const MaterialPaper: React.FC<MaterialPaperProps> = ({
  children,
  sx = {},
  ...props
}) => {
  return (
    <Paper
      sx={{
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default MaterialPaper;
