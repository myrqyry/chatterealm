import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface MaterialButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'text' | 'outlined' | 'contained';
  loading?: boolean;
  children: React.ReactNode;
}

const MaterialButton = React.forwardRef<HTMLButtonElement, MaterialButtonProps>(({
  variant = 'contained',
  loading = false,
  disabled,
  children,
  sx = {},
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      disabled={disabled || loading}
      sx={{
        fontFamily: 'JetBrains Mono',
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: 2,
        px: 3,
        py: 1,
        minHeight: 40,
        ...sx
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            mr: 1,
            color: variant === 'contained' ? 'inherit' : 'primary.main'
          }}
        />
      )}
      {children}
    </Button>
  );
});

MaterialButton.displayName = 'MaterialButton';

export default MaterialButton;
