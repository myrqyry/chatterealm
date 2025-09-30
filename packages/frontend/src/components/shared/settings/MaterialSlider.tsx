import React from 'react';
import { Slider, Typography, Box, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface MaterialSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
  showReset?: boolean;
  resetValue?: number;
  onReset?: () => void;
  disabled?: boolean;
}

const MaterialSlider: React.FC<MaterialSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  description,
  showReset = false,
  resetValue,
  onReset,
  disabled = false,
}) => {
  const marks = step >= 1 ? [
    { value: min, label: `${min}${unit}` },
    { value: max, label: `${max}${unit}` },
  ] : undefined;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="body1" sx={{ flex: 1 }}>
          {label}: {value}{unit}
        </Typography>
        {showReset && onReset && (
          <IconButton
            size="small"
            onClick={onReset}
            sx={{ color: 'text.secondary' }}
            disabled={disabled}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, newValue) => onChange(newValue as number)}
        disabled={disabled}
        marks={marks}
        valueLabelDisplay="auto"
        sx={{
          '& .MuiSlider-markLabel': {
            fontSize: '0.75rem',
            fontWeight: 600,
          },
        }}
      />

      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default MaterialSlider;
