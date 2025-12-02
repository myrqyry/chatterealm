import React from 'react';
import { Label } from "@/components/ui/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/ui/select";
import { cn } from "@/lib/utils";

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
  return (
    <div className={`control-group dropdown ${className} mb-2`}>
      <Label className="font-['JetBrains_Mono'] text-sm font-medium mb-1 block">
        {label}
      </Label>

      <Select onValueChange={onChange} value={String(value)}>
        <SelectTrigger className="w-full bg-background border-input">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <p className="font-['JetBrains_Mono'] text-xs text-muted-foreground italic mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default SettingDropdown;