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
    <Box className={`flex items-start mb-2 ${className}`}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={handleChange}
            className="text-primary"
          />
        }
        label={
          <Box className="ml-2">
            <Typography className="text-primary text-sm font-medium mb-0.5">
              {label}
            </Typography>
            {description && (
              <Typography className="text-secondary text-xs italic">
                {description}
              </Typography>
            )}
          </Box>
        }
        sx={{
          alignItems: 'flex-start',
          margin: 0,
          width: '100%',
        }}
      />
    </Box>
  );
};

export default SettingCheckbox;
