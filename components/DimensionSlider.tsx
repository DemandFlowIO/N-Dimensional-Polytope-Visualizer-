
import React from 'react';

interface DimensionSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN_DIMENSION = 1;
const MAX_DIMENSION = 17;

export const DimensionSlider: React.FC<DimensionSliderProps> = ({ value, onChange }) => {
  // Create sparse labels for better readability across the wider range.
  // Shows the first, last, and labels every 4 steps.
  const labels = Array.from({ length: MAX_DIMENSION - MIN_DIMENSION + 1 }, (_, i) => i + MIN_DIMENSION)
    .filter(n => n === MIN_DIMENSION || n === MAX_DIMENSION || (n > MIN_DIMENSION && n < MAX_DIMENSION && (n - MIN_DIMENSION) % 4 === 0));

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <label htmlFor="dimension-slider" className="text-lg font-medium text-gray-300">
        Dimension (n): <span className="font-bold text-2xl text-teal-400 w-10 inline-block text-center">{value}</span>
      </label>
      <input
        id="dimension-slider"
        type="range"
        min={MIN_DIMENSION}
        max={MAX_DIMENSION}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-teal-500"
      />
      <div className="w-full flex justify-between text-xs text-gray-500 px-1">
        {labels.map(label => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
};
