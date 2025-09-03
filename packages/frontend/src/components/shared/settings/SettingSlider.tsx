import React from 'react';

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
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleReset = () => {
    if (resetValue !== undefined) {
      onChange(resetValue);
    }
  };

  return (
    <div className={`control-group slider ${className}`}>
      <div className="control-header">
        <label>{label}: {value}{unit}</label>
        <span className="control-value">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
      />
      {showReset && resetValue !== undefined && (
        <button
          className="reset-btn"
          onClick={handleReset}
          title={`Reset to ${resetValue}${unit}`}
        >
          Reset
        </button>
      )}
      {description && (
        <span className="setting-description">{description}</span>
      )}
    </div>
  );
};

export default SettingSlider;
