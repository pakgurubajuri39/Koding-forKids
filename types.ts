
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type BlockType = 'MOVE_UP' | 'MOVE_DOWN' | 'MOVE_LEFT' | 'MOVE_RIGHT' | 'REPEAT_2' | 'REPEAT_3';

export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  name: string;
  gridSize: number;
  start: Position;
  target: Position;
  obstacles: Position[];
  availableBlocks: BlockType[];
  maxBlocks: number;
  story: string;
}

export interface GameState {
  currentLevel: number;
  program: BlockType[];
  playerPosition: Position;
  isExecuting: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  executionIndex: number;
  message: string;
  lives: number;
}
