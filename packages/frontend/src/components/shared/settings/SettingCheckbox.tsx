import React from 'react';

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
    <div className={`control-group checkbox ${className}`}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
        />
        {label}
      </label>
      {description && (
        <span className="setting-description">{description}</span>
      )}
    </div>
  );
};

export default SettingCheckbox;
