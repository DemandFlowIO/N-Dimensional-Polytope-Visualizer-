
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PolytopeCard } from './components/PolytopeCard';
import { DimensionSlider } from './components/DimensionSlider';
import { RotationControls } from './components/RotationControls';
import { generateSimplex, generateCube, generateOrthoplex, CUBE_DIM_CAP } from './services/polytopeGenerator';
import type { PolytopeData, PointND, Edge, RotationPlane } from './types';

// Define the shape for storing n-dimensional data separately
interface NdPolytope {
  name: string;
  description: string;
  vertices: PointND[];
  edges: Edge[];
}

// Helper to generate all unique 2D rotation planes for a given dimension
const generateRotationPlanes = (n: number): RotationPlane[] => {
  const planes: RotationPlane[] = [];
  if (n < 2) return planes;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      planes.push({ p: [i, j], angle: 0 });
    }
  }
  return planes;
};

// Helper to calculate the optimal scale factor to fit the polytope in the view
const calculateScale = (vertices: PointND[]): number => {
  if (vertices.length === 0) return 150;
  let maxDistSq = 0;
  for (const v of vertices) {
    const distSq = v.reduce((acc, val) => acc + val * val, 0);
    if (distSq > maxDistSq) maxDistSq = distSq;
  }
  const maxDist = Math.sqrt(maxDistSq);
  
  // Viewport half-width is roughly 175px. 
  // We target a radius of 140px to leave padding.
  return maxDist > 0 ? 140 / maxDist : 150;
};

const App: React.FC = () => {
  // State for the slider's immediate value.
  const [dimension, setDimension] = useState<number>(3);
  // Debounced dimension value to prevent expensive calculations on every slider move.
  const [debouncedDimension, setDebouncedDimension] = useState<number>(3);
  
  // State for the raw N-dimensional polytope data.
  const [ndPolytopes, setNdPolytopes] = useState<NdPolytope[]>([]);
  // State for the final projected 2D data to be rendered.
  const [projectedPolytopes, setProjectedPolytopes] = useState<PolytopeData[]>([]);

  // State for rotation controls, now generated dynamically.
  const [rotations, setRotations] = useState<RotationPlane[]>(() => generateRotationPlanes(3));
  const [isPlaying, setIsPlaying] = useState(true);

  // Loading state for user feedback during generation.
  const [isGenerating, setIsGenerating] = useState(true);

  const polytopeGenerators = useMemo(() => [
    {
      name: 'n-Simplex',
      description: 'The tetrahedron analogue in dimension n',
      generator: generateSimplex,
    },
    {
      name: 'n-Cube',
      description: 'The cube analogue in dimension n',
      generator: generateCube,
    },
    {
      name: 'n-Orthoplex',
      description: 'The octahedron analogue in dimension n',
      generator: generateOrthoplex,
    },
  ], []);

  // Debounce the dimension slider input.
  useEffect(() => {
    setIsGenerating(true); // Show loading state as soon as user starts changing dimension
    const handler = setTimeout(() => {
      setDebouncedDimension(dimension);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [dimension]);

  // EFFECT 1: Generate N-dimensional polytopes when debounced dimension changes.
  useEffect(() => {
    try {
      const newNdPolytopes = polytopeGenerators.map(({ name, description, generator }) => {
        let currentDescription = description;
        if (name === 'n-Cube' && debouncedDimension > CUBE_DIM_CAP) {
          currentDescription = `The cube analogue in dimension n (capped at ${CUBE_DIM_CAP}D for performance).`;
        }
        const { vertices, edges } = generator(debouncedDimension);
        return { name, description: currentDescription, vertices, edges };
      });
      setNdPolytopes(newNdPolytopes);
    } catch (e) {
      console.error("Error generating polytopes:", e);
    } finally {
      setIsGenerating(false); // Hide loading state after generation
    }
  }, [debouncedDimension, polytopeGenerators]);

  // EFFECT 2: Update rotation planes when dimension changes.
  useEffect(() => {
    setRotations(prevRotations => {
      const newPlanes = generateRotationPlanes(debouncedDimension);
      // Preserve angles for existing planes to avoid a jarring reset.
      return newPlanes.map(newPlane => {
        const oldPlane = prevRotations.find(
          old => old.p[0] === newPlane.p[0] && old.p[1] === newPlane.p[1]
        );
        return oldPlane || newPlane;
      });
    });
  }, [debouncedDimension]);

  const project = useCallback((points: PointND[], scale: number) => {
    const rotatedPoints = points.map(point => {
      const p = [...point]; // Create a mutable copy

      rotations.forEach(({ p: [i, j], angle }) => {
        // Guard against applying a rotation axis that doesn't exist on the point,
        // which can happen during a dimension change.
        if (p[i] === undefined || p[j] === undefined) {
          return;
        }
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const x_i = p[i];
        const x_j = p[j];
        p[i] = c * x_i - s * x_j;
        p[j] = s * x_i + c * x_j;
      });
      return p;
    });

    return rotatedPoints.map(p => ({
      x: (p[0] || 0) * scale,
      y: (p[1] || 0) * scale,
    }));
  }, [rotations]);

  // EFFECT 3: Project N-dimensional data to 2D for rendering.
  useEffect(() => {
    if (ndPolytopes.length === 0) return;

    const newProjectedPolytopes = ndPolytopes.map(({ name, description, vertices, edges }) => {
      // Calculate a dynamic scale so the polytope always fits the view
      const scale = calculateScale(vertices);
      const projectedVertices = project(vertices, scale);
      return { 
        name, 
        description, 
        vertices: projectedVertices, 
        edges, 
        key: `${name}-${debouncedDimension}` // Stable key for React rendering
      };
    });
    setProjectedPolytopes(newProjectedPolytopes);
  }, [ndPolytopes, project, debouncedDimension]);

  
  // EFFECT 4: Animation loop for rotation.
  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    const animate = () => {
      setRotations(prevRotations =>
        prevRotations.map((rot, index) => ({
          ...rot,
          angle: (rot.angle + 0.002 * (index * 0.2 + 1)) % (2 * Math.PI),
        }))
      );
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  const handleAngleChange = (plane: [number, number], newAngle: number) => {
    if (isPlaying) setIsPlaying(false);
    setRotations(prev =>
      prev.map(rot =>
        (rot.p[0] === plane[0] && rot.p[1] === plane[1])
          ? { ...rot, angle: newAngle }
          : rot
      )
    );
  };
  
  const handleTogglePlay = () => setIsPlaying(p => !p);

  const handleResetRotations = () => {
    setRotations(prev => prev.map(rot => ({ ...rot, angle: 0 })));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-teal-400 tracking-tight">
          N-Dimensional Polytope Visualizer
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Explore higher-dimensional geometry projected into 2D space.
        </p>
      </header>

      <main className="w-full max-w-5xl flex-grow">
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl mb-8 flex flex-col max-h-[600px]">
          <div className="flex flex-col md:flex-row gap-8 overflow-hidden flex-1">
            <div className="md:w-1/3 flex flex-col justify-center flex-shrink-0">
               <DimensionSlider value={dimension} onChange={setDimension} />
            </div>
            <div className="md:w-2/3 border-t-2 md:border-t-0 md:border-l-2 border-gray-700 md:pl-8 pt-6 md:pt-0 overflow-y-auto">
               <RotationControls
                rotations={rotations}
                onAngleChange={handleAngleChange}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onReset={handleResetRotations}
              />
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}>
          {projectedPolytopes.map(polytope => (
            <PolytopeCard
              key={polytope.key}
              name={polytope.name}
              description={polytope.description}
              vertices={polytope.vertices}
              edges={polytope.edges}
            />
          ))}
        </div>
      </main>
      <footer className="w-full max-w-5xl text-center mt-8 py-4 text-gray-500">
        <p>Built with React, TypeScript, Tailwind CSS, and D3.js</p>
      </footer>
    </div>
  );
};

export default App;
