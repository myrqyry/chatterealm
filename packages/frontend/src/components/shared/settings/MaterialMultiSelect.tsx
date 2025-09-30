import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Box, Typography } from '@mui/material';

interface MaterialMultiSelectProps {
  label: string;
  value: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  description?: string;
}

const MaterialMultiSelect: React.FC<MaterialMultiSelectProps> = ({ label, value, options, onChange, description }) => {
  const handleChange = (event: any) => {
    const v = event.target.value as string[];
    onChange(v);
  };

  return (
    <Box sx={{ width: '100%' }} className="mb-3">
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          multiple
          value={value}
          onChange={handleChange}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((s) => (
                <Typography key={s} sx={{ fontSize: '0.8rem' }}>{s}</Typography>
              ))}
            </Box>
          )}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Checkbox checked={value.indexOf(opt.value) > -1} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {description && (
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>{description}</Typography>
      )}
    </Box>
  );
};

export default MaterialMultiSelect;
