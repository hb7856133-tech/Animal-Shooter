export type AnimalType =
  | 'panda'
  | 'tiger'
  | 'lion'
  | 'frog'
  | 'fox'
  | 'monkey'
  | 'rabbit'
  | 'elephant'
  | 'rock'
  | 'rainbow'
  | 'bomb';

export interface AnimalDef {
  id: AnimalType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  isSpecial?: boolean;
}

export interface HexCoord {
  row: number;
  col: number;
}

export interface GridPiece {
  row: number;
  col: number;
  type: AnimalType;
  x: number;
  y: number;
  radius: number;
  scale: number;
  opacity: number;
  isPopping?: boolean;
  popTimer?: number;
}

export interface FallingPiece {
  id: string;
  type: AnimalType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  opacity: number;
  scale: number;
  bounces: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: AnimalType;
  active: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface TrajectoryResult {
  points: TrajectoryPoint[];
  targetCoord: HexCoord | null;
  targetPos: { x: number; y: number } | null;
  isValidTarget: boolean;
}

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  maxShots: number;
  starScores: [number, number, number];
  rows: number;
  cols: number;
  allowedAnimals: AnimalType[];
  layout: (AnimalType | null)[][];
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  duration: number;
  elapsed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'sparkle' | 'circle' | 'star' | 'smoke';
  rotation: number;
  vRot: number;
}

export interface GameStats {
  score: number;
  shotsRemaining: number;
  comboCount: number;
  currentLevel: number;
  starsEarned: Record<number, number>;
  highScores: Record<number, number>;
  animalsCleared: number;
}
