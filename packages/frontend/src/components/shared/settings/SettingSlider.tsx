import React from 'react';
import { Slider, Typography, Box, Button, FormLabel } from '@mui/material';
import { RestartAlt as ResetIcon } from '@mui/icons-material';

interface SettingSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  showReset?: boolean;
  resetValue?: number;
  description?: string;
  className?: string;
}

const SettingSlider: React.FC<SettingSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  showReset = false,
  resetValue,
  description,
  className = ''
}) => {
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const handleReset = () => {
    if (resetValue !== undefined) {
      onChange(resetValue);
    }
  };

  return (
    <Box sx={{ mb: 3 }} className={className}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <FormLabel sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
          {label}
        </FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.875rem', fontWeight: 600, color: 'primary', minWidth: '60px', textAlign: 'right' }}>
            {value}{unit}
          </Typography>
          {showReset && resetValue !== undefined && (
            <Button
              size="small"
              onClick={handleReset}
              startIcon={<ResetIcon />}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: 'text.secondary',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  borderColor: 'rgba(139, 92, 246, 0.4)'
                }
              }}
              title={`Reset to ${resetValue}${unit}`}
            >
              Reset
            </Button>
          )}
        </Box>
      </Box>

      <Slider
        value={value}
        onChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        sx={{
          color: 'primary.main',
          '& .MuiSlider-thumb': {
            width: 20,
            height: 20,
            backgroundColor: 'primary.main',
            border: '2px solid',
            borderColor: 'primary.contrastText',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px rgba(137, 180, 250, 0.16)`,
            },
          },
          '& .MuiSlider-track': {
            height: 6,
            backgroundColor: 'primary.main',
          },
          '& .MuiSlider-rail': {
            height: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      />

      {description && (
        <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'text.secondary', fontStyle: 'italic', mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default SettingSlider;