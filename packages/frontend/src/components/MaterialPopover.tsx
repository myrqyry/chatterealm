import React from 'react';
import { Popover, PopoverProps } from '@mui/material';

interface MaterialPopoverProps extends Omit<PopoverProps, 'PaperProps'> {
  children: React.ReactNode;
  fullHeight?: boolean;
}

const MaterialPopover: React.FC<MaterialPopoverProps> = ({
  children,
  fullHeight = false,
  ...props
}) => {
  return (
    <Popover
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(25, 23, 36, 0.95)',
          border: '1px solid rgba(196, 167, 231, 0.2)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          ...(fullHeight && {
            height: 'calc(100vh - 80px)',
            maxHeight: 'calc(100vh - 80px)',
          }),
        }
      }}
      {...props}
    >
      {children}
    </Popover>
  );
};

export default MaterialPopover;
