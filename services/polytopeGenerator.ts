
import type { PointND, Edge } from '../types';

interface PolytopeGeometry {
  vertices: PointND[];
  edges: Edge[];
}

/**
 * Generates an n-Simplex.
 * This is a non-regular simplex with n+1 vertices.
 * We generate it based on the standard basis and then center it at the origin
 * so it rotates symmetrically.
 */
export const generateSimplex = (n: number): PolytopeGeometry => {
  if (n < 1) return { vertices: [], edges: [] };
  
  // 1. Generate initial vertices: Origin + points on each axis
  const rawVertices: PointND[] = [Array(n).fill(0)];
  for (let i = 0; i < n; i++) {
    const vertex = Array(n).fill(0);
    vertex[i] = 1;
    rawVertices.push(vertex);
  }

  // 2. Calculate Centroid
  const centroid = Array(n).fill(0);
  for (const v of rawVertices) {
    for (let d = 0; d < n; d++) {
      centroid[d] += v[d];
    }
  }
  const numVertices = n + 1;
  for (let d = 0; d < n; d++) {
    centroid[d] /= numVertices;
  }

  // 3. Center the vertices by subtracting the centroid
  const vertices = rawVertices.map(v => 
    v.map((coord, d) => coord - centroid[d])
  );

  // 4. Connect all vertices (Simplex is a complete graph)
  const edges: Edge[] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      edges.push({ source: i, target: j });
    }
  }

  return { vertices, edges };
};

/**
 * For performance reasons, we cap the dimension of the n-Cube.
 * The number of vertices (2^n) and edges (n*2^(n-1)) grows exponentially,
 * and browsers struggle to render force-directed graphs with more than a
 * few thousand nodes. This value is exported to be shown in the UI.
 */
export const CUBE_DIM_CAP = 11;

/**
 * Generates an n-Cube (Hypercube).
 * It has 2^n vertices, represented by coordinates (±0.5, ±0.5, ...).
 * An edge connects vertices that differ in exactly one coordinate.
 */
export const generateCube = (n: number): PolytopeGeometry => {
  if (n < 1) return { vertices: [], edges: [] };

  const effectiveN = Math.min(n, CUBE_DIM_CAP);
  const numVertices = 1 << effectiveN;
  const vertices: PointND[] = [];
  
  for (let i = 0; i < numVertices; i++) {
    const vertex: PointND = Array(n).fill(0); // Always create n-dimensional points for projection
    for (let j = 0; j < effectiveN; j++) {
      vertex[j] = (i >> j) & 1 ? 0.5 : -0.5;
    }
    vertices.push(vertex);
  }

  const edges: Edge[] = [];
  // Optimized edge generation: O(n * 2^n) instead of O((2^n)^2 * n)
  // An edge exists if the binary representation of two vertex indices differs by one bit.
  for (let i = 0; i < numVertices; i++) {
    for (let j = 0; j < effectiveN; j++) {
      const neighbor = i ^ (1 << j);
      // Add edge only if i < neighbor to avoid duplicates
      if (i < neighbor) {
        edges.push({ source: i, target: neighbor });
      }
    }
  }

  return { vertices, edges };
};

/**
 * Generates an n-Orthoplex (Cross-polytope).
 * It has 2n vertices, located at ±1 on each axis.
 * An edge connects any two vertices unless they are opposites.
 */
export const generateOrthoplex = (n: number): PolytopeGeometry => {
  if (n < 1) return { vertices: [], edges: [] };
  const vertices: PointND[] = [];
  for (let i = 0; i < n; i++) {
    const v1 = Array(n).fill(0);
    v1[i] = 1;
    vertices.push(v1);
    const v2 = Array(n).fill(0);
    v2[i] = -1;
    vertices.push(v2);
  }

  const edges: Edge[] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      // Check if they are not opposites
      let isOpposite = true;
      for(let k = 0; k < n; k++) {
        if(vertices[i][k] !== -vertices[j][k]) {
          isOpposite = false;
          break;
        }
      }
      if (!isOpposite) {
        edges.push({ source: i, target: j });
      }
    }
  }

  return { vertices, edges };
};
