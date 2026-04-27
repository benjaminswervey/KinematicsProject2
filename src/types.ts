export interface ModelData {
  model: string;
  ux: number;
  uy: number;
  phi: number;
  exPercent?: number;
  eyPercent?: number;
  ephiPercent?: number;
  color: string;
  visible: boolean;
  dash?: string;
  lineWidth?: number;
}

export interface SimulationParams {
  ay: number;
  ax: number;
  w: number;
}

export interface ShapePoint {
  x: number;
  y: number;
}

export interface ModelLine {
  id: string;
  points: ShapePoint[];
  color: string;
  dash?: string;
}
