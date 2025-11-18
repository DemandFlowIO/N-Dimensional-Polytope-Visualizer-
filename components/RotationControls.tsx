
import React from 'react';
import type { RotationPlane } from '../types';

interface RotationControlsProps {
  rotations: RotationPlane[];
  onAngleChange: (plane: [number, number], newAngle: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

const axisNames = ['x', 'y', 'z', 'w', 'v', 'u'];

export const RotationControls: React.FC<RotationControlsProps> = ({
  rotations,
  onAngleChange,
  isPlaying,
  onTogglePlay,
  onReset,
}) => {
  return (
    <div className="flex-1 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-300">Rotation Controls</h3>
        <div className="flex space-x-2">
          <button
            onClick={onTogglePlay}
            className="px-3 py-1 text-sm font-semibold bg-gray-700 hover:bg-teal-500 rounded-md transition-colors"
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1 text-sm font-semibold bg-gray-700 hover:bg-teal-500 rounded-md transition-colors"
            aria-label="Reset rotations"
          >
            Reset
          </button>
        </div>
      </div>
      {rotations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {rotations.map((rotation, index) => {
            const [d1, d2] = rotation.p;
            const label = `Plane ${axisNames[d1] || d1 + 1}-${axisNames[d2] || d2 + 1}`;
            const angleInDegrees = Math.round(rotation.angle * 180 / Math.PI);

            return (
              <div key={index} className="flex flex-col">
                <label htmlFor={`rotation-slider-${index}`} className="text-xs text-gray-400 mb-1 flex justify-between">
                  <span>{label}</span>
                  <span className="font-mono w-10 text-right">{angleInDegrees}°</span>
                </label>
                <input
                  id={`rotation-slider-${index}`}
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step="0.01"
                  value={rotation.angle}
                  onChange={(e) => onAngleChange(rotation.p, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-teal-500"
                  aria-label={`Rotation on ${label} plane`}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No rotation available for 1D.
        </div>
      )}
    </div>
  );
};
