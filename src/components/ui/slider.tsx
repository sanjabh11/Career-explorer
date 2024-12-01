import React from 'react';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[];
  onValueChange?: (values: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.([newValue]);
    };

    return (
      <input
        type="range"
        ref={ref}
        value={value[0]}
        onChange={handleChange}
        className={`w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:w-4 
          [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:bg-primary 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:border-2 
          [&::-webkit-slider-thumb]:border-primary 
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4 
          [&::-moz-range-thumb]:h-4 
          [&::-moz-range-thumb]:bg-primary 
          [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:border-2 
          [&::-moz-range-thumb]:border-primary 
          [&::-moz-range-thumb]:cursor-pointer
          ${className}`}
        {...props}
      />
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
