import React from 'react';
import { FormControlLabel, Checkbox, Typography, Box } from '@mui/material';

interface MaterialCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

const MaterialCheckbox: React.FC<MaterialCheckboxProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}) => {
  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            disabled={disabled}
            sx={{
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body1" gutterBottom={false}>
              {label}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        }
      />
    </Box>
  );
};

export default MaterialCheckbox;
