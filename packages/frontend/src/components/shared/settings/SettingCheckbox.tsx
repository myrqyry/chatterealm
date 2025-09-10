import React from 'react';
import { FormControlLabel, Checkbox, Typography, Box } from '@mui/material';

interface SettingCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

const SettingCheckbox: React.FC<SettingCheckboxProps> = ({
  label,
  checked,
  onChange,
  description,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <Box className={`control-group checkbox ${className} mb-2`}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={handleChange}
            sx={{
              '&.Mui-checked': {
                color: 'var(--color-primary)',
              },
              '& .MuiSvgIcon-root': {
                fontSize: 20,
              },
            }}
            className="text-text-secondary"
          />
        }
        label={
          <Box className="jetbrains text-sm font-medium text-text-primary mb-0.5">
            <Typography className="jetbrains text-sm font-medium text-text-primary mb-0.5">
              {label}
            </Typography>
            {description && (
              <Typography className="jetbrains text-xs text-text-secondary italic">
                {description}
              </Typography>
            )}
          </Box>
        }
        sx={{
          alignItems: 'flex-start',
          margin: 0,
          width: '100%',
          '& .MuiFormControlLabel-label': {
            marginLeft: 1,
          },
        }}
      />
    </Box>
  );
};

export default SettingCheckbox;
