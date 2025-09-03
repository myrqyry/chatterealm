import React from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface SettingDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`control-group ${className}`}>
      <label>{label}</label>
      <select
        className="dropdown"
        value={value}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon && `${option.icon} `}{option.label}
          </option>
        ))}
      </select>
      {description && (
        <span className="setting-description">{description}</span>
      )}
    </div>
  );
};

export default SettingDropdown;
