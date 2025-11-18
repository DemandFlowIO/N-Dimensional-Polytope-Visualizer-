
import React from 'react';
import { Visualization } from './Visualization';
import type { Point2D, Edge } from '../types';

interface PolytopeCardProps {
  name: string;
  description: string;
  vertices: Point2D[];
  edges: Edge[];
}

export const PolytopeCard: React.FC<PolytopeCardProps> = ({ name, description, vertices, edges }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden h-full">
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-teal-400">{name}</h2>
        <p className="text-gray-400 mt-1">{description}</p>
      </div>
      <div className="flex-grow flex items-center justify-center p-2 min-h-[350px] bg-gray-800/50">
        <Visualization vertices={vertices} edges={edges} />
      </div>
    </div>
  );
};
