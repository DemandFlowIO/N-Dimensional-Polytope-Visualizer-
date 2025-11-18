
export type PointND = number[];

export interface Point2D {
  x: number;
  y: number;
}

export interface Edge {
  source: number;
  target: number;
}

export interface PolytopeData {
  key: string;
  name: string;
  description: string;
  vertices: Point2D[];
  edges: Edge[];
}

export interface RotationPlane {
  p: [number, number];
  angle: number;
}
