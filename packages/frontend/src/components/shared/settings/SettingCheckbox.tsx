import React from 'react';
import { Label } from "@/components/ui/ui/label";
import { Checkbox } from "@/components/ui/ui/checkbox";
import { cn } from "@/lib/utils";

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
    <div className={`flex items-start mb-2 ${className}`}>
      <Checkbox
        id={label.replace(/\s+/g, '-').toLowerCase()}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <div className="ml-2">
        <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="text-sm font-medium mb-0.5">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground italic">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingCheckbox;