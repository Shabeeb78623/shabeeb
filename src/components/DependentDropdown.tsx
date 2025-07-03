
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DependentDropdownOption {
  value: string;
  label: string;
  children?: DependentDropdownOption[];
}

interface DependentDropdownProps {
  label: string;
  parentValue?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: DependentDropdownOption[];
  placeholder?: string;
  disabled?: boolean;
}

const DependentDropdown: React.FC<DependentDropdownProps> = ({
  label,
  parentValue,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false
}) => {
  const [availableOptions, setAvailableOptions] = useState<DependentDropdownOption[]>([]);

  useEffect(() => {
    if (parentValue) {
      // Find the parent option and get its children
      const parentOption = options.find(option => option.value === parentValue);
      if (parentOption && parentOption.children) {
        setAvailableOptions(parentOption.children);
      } else {
        setAvailableOptions([]);
      }
    } else {
      // If no parent value, show top-level options
      setAvailableOptions(options);
    }
  }, [parentValue, options]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || availableOptions.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            availableOptions.length === 0 
              ? "No options available" 
              : placeholder
          } />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DependentDropdown;
