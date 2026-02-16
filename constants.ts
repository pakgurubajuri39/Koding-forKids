
import { Level, BlockType } from './types';

const generateLevels = (): Level[] => {
  const levels: Level[] = [];
  
  // Helper for basic blocks
  const basicMove: BlockType[] = ['MOVE_UP', 'MOVE_DOWN', 'MOVE_LEFT', 'MOVE_RIGHT'];
  const allBlocks: BlockType[] = [...basicMove, 'REPEAT_2', 'REPEAT_3'];

  // Levels 1-10: Basics
  for (let i = 1; i <= 10; i++) {
    levels.push({
      id: i,
      name: `Ramadan Day ${i}: ${i % 2 === 0 ? 'Sedekah' : 'Persiapan'}`,
      gridSize: 5,
      start: { x: 0, y: 0 },
      target: { x: Math.min(i, 4), y: Math.max(0, i - 4) },
      obstacles: i > 5 ? [{ x: 1, y: 0 }, { x: 1, y: 1 }] : [],
      availableBlocks: i < 5 ? ['MOVE_RIGHT', 'MOVE_DOWN'] : basicMove,
      maxBlocks: 8,
      story: `Misi hari ke-${i}: Bantu Ahmad mencapai tujuan untuk aktivitas Ramadan hari ini!`
    });
  }

  // Levels 11-25: Introducing Obstacles & REPEAT_2
  for (let i = 11; i <= 25; i++) {
    levels.push({
      id: i,
      // Fix: Use double quotes for the inner strings in the ternary expression to avoid syntax errors with 'I'tikaf'
      name: `Ramadan Day ${i}: ${i % 3 === 0 ? "Tarawih" : "I'tikaf"}`,
      gridSize: 6,
      start: { x: 0, y: 5 },
      target: { x: 5, y: 0 },
      obstacles: [
        { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 4 }, 
        { x: Math.floor(i/5), y: Math.floor(i/4) }
      ],
      availableBlocks: i < 20 ? [...basicMove] : [...basicMove, 'REPEAT_2'],
      maxBlocks: i < 20 ? 12 : 8,
      story: `Tantangan hari ke-${i} semakin seru! Hindari rintangan dan gunakan logika kodingmu.`
    });
  }

  // Levels 26-40: Complex Grids & REPEAT_3
  for (let i = 26; i <= 40; i++) {
    levels.push({
      id: i,
      name: `Ramadan Day ${i}: Menuju Lebaran`,
      gridSize: 7,
      start: { x: 0, y: 0 },
      target: { x: 6, y: 6 },
      obstacles: [
        { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, 
        { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 0, y: 1 }, { x: 1, y: 0 }
      ].filter((_, idx) => idx % (i % 3 + 1) === 0),
      availableBlocks: allBlocks,
      maxBlocks: 10,
      story: `Ahmad harus berhemat langkah! Gunakan blok REPEAT untuk rute yang efisien.`
    });
  }

  // Levels 41-50: Expert Levels
  for (let i = 41; i <= 50; i++) {
    levels.push({
      id: i,
      name: `Ramadan Day ${i}: Persiapan Mudik`,
      gridSize: 8,
      start: { x: 7, y: 7 },
      target: { x: 0, y: 0 },
      obstacles: Array.from({ length: 10 }).map((_, idx) => ({
        x: (idx * 2 + i) % 8,
        y: (idx * 3 + i) % 8
      })).filter(p => !(p.x === 0 && p.y === 0) && !(p.x === 7 && p.y === 7)),
      availableBlocks: allBlocks,
      maxBlocks: 7,
      story: `Level Expert! Hanya tersedia sedikit blok koding. Pikirkan matang-matang langkah Ahmad.`
    });
  }

  return levels;
};

export const LEVELS: Level[] = generateLevels();

export const BLOCK_LABELS: Record<BlockType, string> = {
  MOVE_UP: "Atas",
  MOVE_DOWN: "Bawah",
  MOVE_LEFT: "Kiri",
  MOVE_RIGHT: "Kanan",
  REPEAT_2: "Ulang 2x",
  REPEAT_3: "Ulang 3x"
};

export const BLOCK_COLORS: Record<BlockType, string> = {
  MOVE_UP: "bg-blue-500",
  MOVE_DOWN: "bg-blue-600",
  MOVE_LEFT: "bg-cyan-500",
  MOVE_RIGHT: "bg-cyan-600",
  REPEAT_2: "bg-purple-600",
  REPEAT_3: "bg-purple-700"
};
