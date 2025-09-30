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
        <InputLabel
          sx={{
            fontFamily: 'JetBrains Mono',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-focused': {
              color: 'primary.main',
            },
          }}
        >
          {label}
        </InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          label={label}
          disabled={disabled}
          sx={{
            fontFamily: 'JetBrains Mono',
            borderRadius: '12px',
            backgroundColor: 'rgba(25, 23, 36, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'rgba(196, 167, 231, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(25, 23, 36, 0.8)',
              borderColor: 'rgba(196, 167, 231, 0.4)',
              boxShadow: '0 4px 12px rgba(196, 167, 231, 0.15)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(25, 23, 36, 0.9)',
              borderColor: 'primary.main',
              boxShadow: '0 0 0 3px rgba(196, 167, 231, 0.1)',
            },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: '12px 16px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'rgba(25, 23, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'rgba(196, 167, 231, 0.2)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(196, 167, 231, 0.1)',
                marginTop: '8px',
                '& .MuiMenuItem-root': {
                  fontFamily: 'JetBrains Mono',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  margin: '4px 8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(196, 167, 231, 0.1)',
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(196, 167, 231, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(196, 167, 231, 0.25)',
                    },
                  },
                },
              },
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
                gap: 1.5,
                fontFamily: 'JetBrains Mono',
                fontWeight: 500,
                '&:hover .option-icon': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              {showIcons && option.icon && (
                <span
                  className="option-icon"
                  style={{
                    fontSize: '1.2em',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {option.icon}
                </span>
              )}
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 500,
                  color: 'text.primary'
                }}
              >
                {option.label}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {description && (
        <Typography
          variant="body2"
          sx={{
            mt: 1.5,
            color: 'text.secondary',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.8rem',
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default MaterialDropdown;
