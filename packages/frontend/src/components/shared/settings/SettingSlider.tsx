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
    <Box className={`control-group slider ${className} mb-3`}>
      <Box className="flex justify-between items-center mb-1">
        <FormLabel className="jetbrains text-sm font-medium text-text-primary">
          {label}
        </FormLabel>
        <Box className="flex items-center gap-1">
          <Typography className="jetbrains text-sm font-semibold text-primary min-w-[60px] text-right">
            {value}{unit}
          </Typography>
          {showReset && resetValue !== undefined && (
            <Button
              size="small"
              onClick={handleReset}
              startIcon={<ResetIcon />}
              className="min-w-auto px-1 py-0.5 text-xs jetbrains no-uppercase bg-purple-900/10 text-text-secondary border border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40"
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
          color: 'var(--color-primary)',
          '& .MuiSlider-thumb': {
            width: 20,
            height: 20,
            backgroundColor: 'var(--color-primary)',
            border: '2px solid var(--color-on-primary)',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px rgba(137, 180, 250, 0.16)`,
            },
          },
          '& .MuiSlider-track': {
            height: 6,
            backgroundColor: 'var(--color-primary)',
          },
          '& .MuiSlider-rail': {
            height: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
        className="w-full"
      />

      {description && (
        <Typography className="jetbrains text-xs text-text-secondary italic mt-0.5">
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default SettingSlider;
