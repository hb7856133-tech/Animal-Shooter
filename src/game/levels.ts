import { AnimalType, LevelConfig } from '../types';

export const TOTAL_LEVELS = 1000;

// All cute animal characters available
export const ALL_ANIMALS: AnimalType[] = [
  'panda',
  'tiger',
  'lion',
  'frog',
  'fox',
  'monkey',
  'rabbit',
  'elephant',
];

// Zone theme biomes in English
export const ZONE_NAMES = [
  'Sunny Savannah',
  'Bamboo Oasis',
  'Rainforest Canopy',
  'River Cascades',
  'Emerald Valley',
  'Lion Ridge',
  'Monkey Highlands',
  'Fox Whispers',
  'Tiger Gorge',
  'Elephant Crossing',
  'Mystic Hollow',
  'Rainbow Plateau',
  'Shadow Peaks',
  'Volcano Caldera',
  'Crystal Forest',
  'Whispering Glade',
  'Golden Serengeti',
  'Ancient Ruins',
  'Celestial Canopy',
  'Apex Sanctuary',
];

export const ZONE_DESCRIPTIONS = [
  'Aim through the monkey cannon and connect 3 matching animals to clear the canopy.',
  'Bank shots off side walls to reach deep animal clusters.',
  'Sever the supporting roots to trigger cascading floater drops!',
  'Watch out for stone obstacles! Drop them by popping their anchor pieces.',
  'Match animals next to coconut bombs to trigger explosive chain blasts.',
  'Use rainbow stars as wildcards to clear tricky animal groups.',
  'Plan bank shots to bounce around tight obstacles.',
  'Keep the canopy from descending below the danger line.',
];

/**
 * Seeded PRNG (Linear Congruential Generator) for deterministic, reproducible level generation.
 */
function createPrng(seed: number) {
  let s = Math.abs(seed) % 2147483647;
  if (s === 0) s = 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// In-memory cache for ultra-fast level retrieval
const levelCache = new Map<number, LevelConfig>();

/**
 * Hand-tuned layout templates for introductory levels (1 to 99)
 */
function generateEarlyLevel(levelId: number): LevelConfig {
  const rand = createPrng(levelId * 3571 + 997);

  const zoneIdx = Math.min(ZONE_NAMES.length - 1, Math.floor((levelId - 1) / 5));
  const zoneName = ZONE_NAMES[zoneIdx % ZONE_NAMES.length];
  const title = `Level ${levelId}: ${zoneName}`;
  const description = ZONE_DESCRIPTIONS[(levelId - 1) % ZONE_DESCRIPTIONS.length];

  // Progressive animal pool
  let animalCount = 3;
  if (levelId >= 4) animalCount = 4;
  if (levelId >= 12) animalCount = 5;
  if (levelId >= 25) animalCount = 6;
  if (levelId >= 50) animalCount = 7;
  if (levelId >= 80) animalCount = 8;

  const shuffled = [...ALL_ANIMALS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const allowedAnimals = shuffled.slice(0, animalCount);

  // Progressive rows: 6 to 9 rows in early levels
  const rows = Math.min(10, 6 + Math.floor(levelId / 20));
  const cols = 11;

  const hasRocks = levelId >= 7;
  const rockRate = hasRocks ? Math.min(0.06, 0.015 + (levelId / 100) * 0.04) : 0;
  const hasBombs = levelId >= 10 && levelId % 3 === 0;
  const hasRainbow = levelId >= 15 && levelId % 4 === 0;

  const layout: (AnimalType | null)[][] = [];
  let totalAnimals = 0;

  for (let r = 0; r < rows; r++) {
    const rowCols = r % 2 === 0 ? cols : cols - 1;
    const row: (AnimalType | null)[] = [];

    let clusterAnimal = allowedAnimals[Math.floor(rand() * allowedAnimals.length)];
    let clusterRemaining = 2 + Math.floor(rand() * 3);

    for (let c = 0; c < rowCols; c++) {
      // Hollow gaps for bank shots on higher early levels
      const isHole = levelId >= 20 && r > 1 && r < rows - 1 && rand() < 0.09;
      if (isHole) {
        row.push(null);
        continue;
      }

      if (hasRocks && r > 1 && rand() < rockRate) {
        row.push('rock');
        totalAnimals++;
        continue;
      }

      if (hasBombs && r > 2 && rand() < 0.02) {
        row.push('bomb');
        totalAnimals++;
        continue;
      }

      if (hasRainbow && r > 1 && rand() < 0.02) {
        row.push('rainbow');
        totalAnimals++;
        continue;
      }

      if (clusterRemaining <= 0) {
        clusterAnimal = allowedAnimals[Math.floor(rand() * allowedAnimals.length)];
        clusterRemaining = 2 + Math.floor(rand() * 3);
      }
      clusterRemaining--;

      row.push(clusterAnimal);
      totalAnimals++;
    }
    layout.push(row);
  }

  // Ensure row 0 has solid anchors
  for (let c = 0; c < cols; c++) {
    if (!layout[0][c] || layout[0][c] === 'rock') {
      layout[0][c] = allowedAnimals[c % allowedAnimals.length];
    }
  }

  const maxShots = Math.max(24, Math.floor(totalAnimals / 3.1) + 8);
  const estScore = totalAnimals * 120 + maxShots * 200;

  return {
    id: levelId,
    title,
    description,
    rows,
    cols,
    allowedAnimals,
    layout,
    maxShots,
    starScores: [
      Math.floor(estScore * 0.4),
      Math.floor(estScore * 0.75),
      Math.floor(estScore * 1.15),
    ],
  };
}

/**
 * Procedural generation script for Levels 100 to 1000.
 * Implements architectural geometric formations:
 * - Honeycomb Clusters
 * - Inverted Triangle Pyramids
 * - Split Flank Wings
 * - Fortress Anchors
 * - Wave Rows
 */
export function generateProceduralLevel(levelId: number): LevelConfig {
  const rand = createPrng(levelId * 104729 + 7919);

  // Difficulty tier calculation
  // Tier 1 (100-250): Journeyman
  // Tier 2 (251-500): Expert
  // Tier 3 (501-750): Master
  // Tier 4 (751-1000): Apex Legend
  const tier =
    levelId < 250 ? 1 : levelId < 500 ? 2 : levelId < 750 ? 3 : 4;

  const tierTitles = ['Journeyman', 'Expert', 'Master', 'Apex'];
  const zoneIndex = Math.min(
    ZONE_NAMES.length - 1,
    Math.floor(((levelId - 1) / TOTAL_LEVELS) * ZONE_NAMES.length)
  );
  const zoneName = ZONE_NAMES[zoneIndex];
  const title = `Level ${levelId}: ${zoneName} [${tierTitles[tier - 1]}]`;
  const description = ZONE_DESCRIPTIONS[(levelId - 100) % ZONE_DESCRIPTIONS.length];

  // Animals pool: 6 to 8 animals in higher levels
  const animalCount = tier === 1 ? 6 : tier === 2 ? 7 : 8;
  const shuffled = [...ALL_ANIMALS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const allowedAnimals = shuffled.slice(0, animalCount);

  // Depth rows: 10 to 14 rows
  const rows = Math.min(14, 10 + (levelId % 5));
  const cols = 11;

  // Formation Archetype
  // 0: Classic Honeycomb
  // 1: Split Flank Wings (open center channel)
  // 2: Inverted Pyramids
  // 3: Fortress Anchors (stone shields guarding clusters)
  // 4: Zig-Zag Wave Canopy
  const formationType = (levelId + Math.floor(levelId / 7)) % 5;

  const rockChance = Math.min(0.08, 0.03 + tier * 0.012);
  const bombChance = 0.03;
  const rainbowChance = 0.025;

  const layout: (AnimalType | null)[][] = [];
  let totalAnimals = 0;

  for (let r = 0; r < rows; r++) {
    const rowCols = r % 2 === 0 ? cols : cols - 1;
    const row: (AnimalType | null)[] = [];

    let currentAnimal = allowedAnimals[Math.floor(rand() * allowedAnimals.length)];
    let clusterRun = 2 + Math.floor(rand() * 3);

    for (let c = 0; c < rowCols; c++) {
      // Apply structural formation masks
      let isMaskedHole = false;

      if (formationType === 1) {
        // Split Flank Wings: open center bank-shot funnel
        const mid = rowCols / 2;
        if (r >= 3 && Math.abs(c - mid) < 1.6) {
          isMaskedHole = true;
        }
      } else if (formationType === 2) {
        // Inverted Pyramids: stair steps
        if (r >= 8 && (c < (r - 7) || c > rowCols - 1 - (r - 7))) {
          isMaskedHole = true;
        }
      } else if (formationType === 4) {
        // Zig-Zag holes
        if (r > 3 && (r + c) % 5 === 0) {
          isMaskedHole = true;
        }
      }

      if (isMaskedHole) {
        row.push(null);
        continue;
      }

      // Stone barriers
      if (r > 1 && r < rows - 1 && rand() < rockChance) {
        row.push('rock');
        totalAnimals++;
        continue;
      }

      // Coconut Bomb
      if (r > 2 && rand() < bombChance) {
        row.push('bomb');
        totalAnimals++;
        continue;
      }

      // Rainbow Wildcard
      if (r > 1 && rand() < rainbowChance) {
        row.push('rainbow');
        totalAnimals++;
        continue;
      }

      // Animal piece
      if (clusterRun <= 0) {
        currentAnimal = allowedAnimals[Math.floor(rand() * allowedAnimals.length)];
        clusterRun = 2 + Math.floor(rand() * 3);
      }
      clusterRun--;

      row.push(currentAnimal);
      totalAnimals++;
    }

    layout.push(row);
  }

  // Guarantee row 0 has solid anchors across the full ceiling
  for (let c = 0; c < cols; c++) {
    if (!layout[0][c] || layout[0][c] === 'rock') {
      layout[0][c] = allowedAnimals[c % allowedAnimals.length];
    }
  }

  // Balanced shot calculations
  const maxShots = Math.min(42, Math.max(26, Math.floor(totalAnimals / 3.0) + 7));
  const estScore = totalAnimals * 120 + maxShots * 200;

  return {
    id: levelId,
    title,
    description,
    rows,
    cols,
    allowedAnimals,
    layout,
    maxShots,
    starScores: [
      Math.floor(estScore * 0.45),
      Math.floor(estScore * 0.78),
      Math.floor(estScore * 1.2),
    ],
  };
}

/**
 * Universal level configuration getter covering levels 1 to 1000.
 */
export function getLevelConfig(id: number): LevelConfig {
  const levelId = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(id)));

  if (levelCache.has(levelId)) {
    return levelCache.get(levelId)!;
  }

  let config: LevelConfig;
  if (levelId < 100) {
    config = generateEarlyLevel(levelId);
  } else {
    // Procedural generation script for levels 100-1000
    config = generateProceduralLevel(levelId);
  }

  levelCache.set(levelId, config);
  return config;
}

export const INITIAL_LEVEL = getLevelConfig(1);
