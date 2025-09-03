import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  SelectChangeEvent,
} from '@mui/material';

export interface MaterialDropdownOption {
  value: string | number;
  label: string;
  icon?: string;
}

interface MaterialDropdownProps {
  label: string;
  value: string | number;
  options: MaterialDropdownOption[];
  onChange: (value: string | number) => void;
  description?: string;
  disabled?: boolean;
  showIcons?: boolean;
}

const MaterialDropdown: React.FC<MaterialDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  description,
  disabled = false,
  showIcons = true,
}) => {
  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl fullWidth>
        <InputLabel sx={{ fontFamily: 'JetBrains Mono' }}>
          {label}
        </InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          label={label}
          disabled={disabled}
          sx={{
            fontFamily: 'JetBrains Mono',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontFamily: 'JetBrains Mono',
              }}
            >
              {showIcons && option.icon && (
                <span style={{ fontSize: '1.2em' }}>{option.icon}</span>
              )}
              <Typography variant="body1" sx={{ fontFamily: 'JetBrains Mono' }}>
                {option.label}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default MaterialDropdown;
