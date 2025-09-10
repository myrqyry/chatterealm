import React from 'react';
import { FormControl, Select, MenuItem, Typography, Box, FormLabel } from '@mui/material';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: string;
}

interface SettingDropdownProps {
  label: string;
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string | number) => void;
  description?: string;
  className?: string;
}

const SettingDropdown: React.FC<SettingDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  description,
  className = ''
}) => {
  const handleChange = (event: any) => {
    onChange(event.target.value);
  };

  return (
    <Box className={`control-group dropdown ${className}`} sx={{ mb: 2 }}>
      <FormLabel sx={{
        fontFamily: 'JetBrains Mono',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--color-text-primary)',
        mb: 1,
        display: 'block',
      }}>
        {label}
      </FormLabel>

      <FormControl fullWidth>
        <Select
          value={value}
          onChange={handleChange}
          sx={{
            backgroundColor: 'var(--color-surface-variant)',
            color: 'var(--color-text-primary)',
            borderRadius: '8px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-outline)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--color-primary)',
              borderWidth: '2px',
            },
            '& .MuiSelect-icon': {
              color: 'var(--color-text-secondary)',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-outline)',
                borderRadius: '8px',
                '& .MuiMenuItem-root': {
                  color: 'var(--color-text-primary)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-primary)',
                    },
                  },
                },
              },
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {description && (
        <Typography
          sx={{
            fontFamily: 'JetBrains Mono',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            mt: 0.5,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default SettingDropdown;
