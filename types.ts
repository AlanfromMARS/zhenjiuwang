
export interface Acupoint {
  id: string;
  name: string;
  chineseName: string;
  meridian: string;
  position: [number, number, number]; // x, y, z
  description: string;
}

export interface Case {
  id: number;
  title: string;
  symptoms: string;
  requiredPoints: string[]; // IDs of acupoints
  difficulty: number;
  reward: number;
}

export interface GameState {
  score: number;
  currentLevel: number;
  isGameOver: boolean;
  hitPoints: string[]; // IDs already hit for current level
  achievements: string[];
}
