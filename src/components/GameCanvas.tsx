import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimalType, GridPiece, HexCoord, Projectile, FallingPiece, LevelConfig, TrajectoryResult } from '../types';
import { ANIMAL_DEFS, drawAnimalPiece } from '../game/animals';
import {
  findBestAttachmentSlot,
  findConnectedCluster,
  findBombCluster,
  findFloatingPieces,
  getHexPosition,
  getNeighbors,
  GRID_MAX_ROWS,
} from '../game/grid';
import { sounds } from '../game/audio';
import { ParticleSystem } from '../game/particles';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  level: LevelConfig;
  score: number;
  shotsRemaining: number;
  onScoreChange: (score: number) => void;
  onShotsChange: (shots: number) => void;
  onComboChange: (combo: number) => void;
  onVictory: (finalScore: number, shotsLeft: number) => void;
  onDefeat: (finalScore: number) => void;
  isPaused: boolean;
}

const STAGE_WIDTH = 440;
const STAGE_HEIGHT = 740;
const BUBBLE_RADIUS = 18;
const START_Y = 48;
const LAUNCHER_X = STAGE_WIDTH / 2;
const LAUNCHER_Y = STAGE_HEIGHT - 65;
const DANGER_Y = LAUNCHER_Y - 55;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  score,
  shotsRemaining,
  onScoreChange,
  onShotsChange,
  onComboChange,
  onVictory,
  onDefeat,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State Refs
  const gridRef = useRef<(GridPiece | null)[][]>([]);
  const projectileRef = useRef<Projectile | null>(null);
  const fallingPiecesRef = useRef<FallingPiece[]>([]);
  const currentAnimalRef = useRef<AnimalType>('panda');
  const nextAnimalRef = useRef<AnimalType>('tiger');
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const comboRef = useRef<number>(0);
  const scoreRef = useRef<number>(score);
  const shotsRef = useRef<number>(shotsRemaining);
  const isGameOverRef = useRef<boolean>(false);

  // Aiming state
  const isAimingRef = useRef<boolean>(false);
  const aimAngleRef = useRef<number>(-Math.PI / 2); // default straight up
  const [aimAngle, setAimAngle] = useState<number>(-Math.PI / 2);
  const recoilRef = useRef<number>(0);
  const [currentAnimalState, setCurrentAnimalState] = useState<AnimalType>('panda');
  const [nextAnimalState, setNextAnimalState] = useState<AnimalType>('tiger');

  // Animation frame
  const animFrameIdRef = useRef<number>(0);

  // Sync props to refs
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    shotsRef.current = shotsRemaining;
  }, [shotsRemaining]);

  // Helper: Get random animal type present currently on board
  const pickRandomActiveAnimal = useCallback((grid: (GridPiece | null)[][]): AnimalType => {
    const present = new Set<AnimalType>();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const p = grid[r][c];
        if (p && p.type !== 'rock' && p.type !== 'bomb') {
          present.add(p.type);
        }
      }
    }
    const pool = present.size > 0 ? Array.from(present) : level.allowedAnimals;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [level.allowedAnimals]);

  // Initialize Level Grid
  const initLevel = useCallback(() => {
    isGameOverRef.current = false;
    comboRef.current = 0;
    projectileRef.current = null;
    fallingPiecesRef.current = [];
    particlesRef.current = new ParticleSystem();

    const newGrid: (GridPiece | null)[][] = [];
    for (let r = 0; r < GRID_MAX_ROWS; r++) {
      const rowCols = r % 2 === 0 ? level.cols : level.cols - 1;
      const rowPieces: (GridPiece | null)[] = [];

      for (let c = 0; c < rowCols; c++) {
        const type = r < level.rows ? level.layout[r]?.[c] : null;
        if (type) {
          const { x, y } = getHexPosition(r, c, BUBBLE_RADIUS, STAGE_WIDTH, level.cols, START_Y);
          rowPieces.push({
            row: r,
            col: c,
            type,
            x,
            y,
            radius: BUBBLE_RADIUS,
            scale: 1.0,
            opacity: 1.0,
          });
        } else {
          rowPieces.push(null);
        }
      }
      newGrid.push(rowPieces);
    }
    gridRef.current = newGrid;

    const firstAnimal = pickRandomActiveAnimal(newGrid);
    const secondAnimal = pickRandomActiveAnimal(newGrid);
    currentAnimalRef.current = firstAnimal;
    nextAnimalRef.current = secondAnimal;
    setCurrentAnimalState(firstAnimal);
    setNextAnimalState(secondAnimal);
  }, [level, pickRandomActiveAnimal]);

  // Initialize when level changes
  useEffect(() => {
    initLevel();
  }, [initLevel]);

  // Swap current & next animal in launcher
  const handleSwapAnimal = () => {
    if (projectileRef.current && projectileRef.current.active) return;
    const temp = currentAnimalRef.current;
    currentAnimalRef.current = nextAnimalRef.current;
    nextAnimalRef.current = temp;
    setCurrentAnimalState(currentAnimalRef.current);
    setNextAnimalState(nextAnimalRef.current);
    sounds.playSwap();
  };

  // Trajectory Raycaster
  const calculateTrajectory = useCallback(
    (angle: number): TrajectoryResult => {
      const points: { x: number; y: number }[] = [{ x: LAUNCHER_X, y: LAUNCHER_Y }];
      let cx = LAUNCHER_X;
      let cy = LAUNCHER_Y;
      let vx = Math.cos(angle);
      let vy = Math.sin(angle);
      const step = 6;
      let bounces = 0;
      const maxBounces = 2;
      const maxSteps = 400;

      const grid = gridRef.current;
      let targetCoord: HexCoord | null = null;
      let targetPos: { x: number; y: number } | null = null;
      let isValidTarget = false;

      for (let i = 0; i < maxSteps; i++) {
        cx += vx * step;
        cy += vy * step;

        // Left wall bounce
        if (cx - BUBBLE_RADIUS <= 10) {
          cx = 10 + BUBBLE_RADIUS;
          vx = -vx;
          points.push({ x: cx, y: cy });
          bounces++;
          if (bounces > maxBounces) break;
        }
        // Right wall bounce
        else if (cx + BUBBLE_RADIUS >= STAGE_WIDTH - 10) {
          cx = STAGE_WIDTH - 10 - BUBBLE_RADIUS;
          vx = -vx;
          points.push({ x: cx, y: cy });
          bounces++;
          if (bounces > maxBounces) break;
        }

        // Ceiling collision
        if (cy - BUBBLE_RADIUS <= START_Y) {
          points.push({ x: cx, y: cy });
          const slot = findBestAttachmentSlot(
            cx,
            cy,
            -1,
            -1,
            grid,
            BUBBLE_RADIUS,
            STAGE_WIDTH,
            level.cols,
            GRID_MAX_ROWS,
            START_Y
          );
          if (slot) {
            targetCoord = slot;
            targetPos = getHexPosition(slot.row, slot.col, BUBBLE_RADIUS, STAGE_WIDTH, level.cols, START_Y);
            isValidTarget = true;
          }
          break;
        }

        // Check collision with any existing piece in grid
        let collided = false;
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            const piece = grid[r]?.[c];
            if (piece) {
              const dist = Math.hypot(cx - piece.x, cy - piece.y);
              if (dist <= BUBBLE_RADIUS * 1.85) {
                points.push({ x: cx, y: cy });
                collided = true;
                const slot = findBestAttachmentSlot(
                  cx,
                  cy,
                  piece.row,
                  piece.col,
                  grid,
                  BUBBLE_RADIUS,
                  STAGE_WIDTH,
                  level.cols,
                  GRID_MAX_ROWS,
                  START_Y
                );
                if (slot) {
                  targetCoord = slot;
                  targetPos = getHexPosition(slot.row, slot.col, BUBBLE_RADIUS, STAGE_WIDTH, level.cols, START_Y);
                  isValidTarget = true;
                }
                break;
              }
            }
          }
          if (collided) break;
        }

        if (collided) break;
      }

      if (points.length === 1 || points[points.length - 1].x !== cx) {
        points.push({ x: cx, y: cy });
      }

      return { points, targetCoord, targetPos, isValidTarget };
    },
    [level.cols, level.rows]
  );

  // Fire Projectile
  const fireProjectile = () => {
    if (projectileRef.current && projectileRef.current.active) return;
    if (shotsRef.current <= 0 || isGameOverRef.current) return;

    const angle = aimAngleRef.current;
    const speed = 21; // Fast and snappy projectile flight
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Trigger monkey cannon recoil animation
    recoilRef.current = 1.0;

    // Launch position directly from the monkey's open mouth
    const mouthTipX = LAUNCHER_X + Math.cos(angle) * 26;
    const mouthTipY = LAUNCHER_Y + Math.sin(angle) * 26;

    // Emit burst of muzzle spark particles from the monkey's mouth
    particlesRef.current.emitBurst(mouthTipX, mouthTipY, '#F59E0B', 12);

    projectileRef.current = {
      x: mouthTipX,
      y: mouthTipY,
      vx,
      vy,
      radius: BUBBLE_RADIUS,
      type: currentAnimalRef.current,
      active: true,
      trail: [],
    };

    sounds.playShoot();

    // Decrement shots
    const newShots = shotsRef.current - 1;
    shotsRef.current = newShots;
    onShotsChange(newShots);

    // Prepare next animal
    currentAnimalRef.current = nextAnimalRef.current;
    nextAnimalRef.current = pickRandomActiveAnimal(gridRef.current);
    setCurrentAnimalState(currentAnimalRef.current);
    setNextAnimalState(nextAnimalRef.current);
  };

  // Attachment & Cluster Resolution
  const handleProjectileAttachment = (
    proj: Projectile,
    hitRow: number = -1,
    hitCol: number = -1
  ) => {
    // Immediately deactivate projectile to prevent any multi-frame physics triggers
    proj.active = false;
    projectileRef.current = null;

    const grid = gridRef.current;
    const slot = findBestAttachmentSlot(
      proj.x,
      proj.y,
      hitRow,
      hitCol,
      grid,
      BUBBLE_RADIUS,
      STAGE_WIDTH,
      level.cols,
      GRID_MAX_ROWS,
      START_Y
    );

    if (!slot) {
      return;
    }

    const { x, y } = getHexPosition(slot.row, slot.col, BUBBLE_RADIUS, STAGE_WIDTH, level.cols, START_Y);
    const newPiece: GridPiece = {
      row: slot.row,
      col: slot.col,
      type: proj.type,
      x,
      y,
      radius: BUBBLE_RADIUS,
      scale: 1.15, // brief impact squish/pop
      opacity: 1.0,
    };

    // Attach to grid
    if (!grid[slot.row]) {
      grid[slot.row] = [];
    }
    grid[slot.row][slot.col] = newPiece;
    sounds.playAttach();

    // Check cluster
    let burstCluster: HexCoord[] = [];
    if (proj.type === 'bomb') {
      burstCluster = findBombCluster(grid, slot.row, slot.col, GRID_MAX_ROWS, level.cols);
      sounds.playExplosion();
      particlesRef.current.emitBurst(x, y, '#EF4444', 35);
      particlesRef.current.addFloatingText('BOOM!', x, y, '#EF4444');
    } else {
      burstCluster = findConnectedCluster(grid, slot.row, slot.col, proj.type, GRID_MAX_ROWS, level.cols);
    }

    // Match requirement: >= 3 pieces (or bomb)
    if (proj.type === 'bomb' || burstCluster.length >= 3) {
      comboRef.current += 1;
      onComboChange(comboRef.current);
      sounds.playPop(comboRef.current);

      const pointsEarned = burstCluster.length * 100 * comboRef.current;
      const newScore = scoreRef.current + pointsEarned;
      scoreRef.current = newScore;
      onScoreChange(newScore);

      // Score flyout
      const comboText = comboRef.current > 1 ? `COMBO x${comboRef.current}! +${pointsEarned}` : `+${pointsEarned}`;
      particlesRef.current.addFloatingText(comboText, x, y - 10, '#FACC15');

      // Pop pieces & emit particles
      burstCluster.forEach((c) => {
        const p = grid[c.row][c.col];
        if (p) {
          const def = ANIMAL_DEFS[p.type];
          particlesRef.current.emitBurst(p.x, p.y, def.primaryColor, 16);
          grid[c.row][c.col] = null;
        }
      });

      // Detach any disconnected floaters!
      const floaters = findFloatingPieces(grid, GRID_MAX_ROWS, level.cols);
      if (floaters.length > 0) {
        sounds.playDrop(floaters.length);
        const dropBonus = floaters.length * 250 * (comboRef.current + 1);
        scoreRef.current += dropBonus;
        onScoreChange(scoreRef.current);

        particlesRef.current.addFloatingText(`DROP BONUS! +${dropBonus}`, x, y + 20, '#38BDF8');

        floaters.forEach((f) => {
          const piece = grid[f.row]?.[f.col];
          if (piece) {
            fallingPiecesRef.current.push({
              id: `${f.row}-${f.col}-${Math.random()}`,
              type: piece.type,
              x: piece.x,
              y: piece.y,
              vx: (Math.random() - 0.5) * 5,
              vy: -2 - Math.random() * 2,
              rotation: 0,
              vRot: (Math.random() - 0.5) * 0.25,
              radius: BUBBLE_RADIUS,
              opacity: 1.0,
              scale: 1.0,
              bounces: 0,
            });
            grid[f.row][f.col] = null;
          }
        });
      }
    } else {
      // No match made: reset combo
      comboRef.current = 0;
      onComboChange(0);
    }

    // Check Win/Loss conditions
    checkGameStatus();
  };

  // Win / Loss Validation
  const checkGameStatus = () => {
    if (isGameOverRef.current) return;

    const grid = gridRef.current;
    let remainingAnimals = 0;
    let lowestY = 0;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const p = grid[r][c];
        if (p) {
          if (p.type !== 'rock') {
            remainingAnimals++;
          }
          if (p.y > lowestY) {
            lowestY = p.y;
          }
        }
      }
    }

    // Victory: All target animals cleared!
    if (remainingAnimals === 0) {
      isGameOverRef.current = true;
      sounds.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      // Remaining shots bonus
      const shotsBonus = shotsRef.current * 300;
      const finalScore = scoreRef.current + shotsBonus;
      scoreRef.current = finalScore;
      onScoreChange(finalScore);

      setTimeout(() => {
        onVictory(finalScore, shotsRef.current);
      }, 900);
      return;
    }

    // Defeat Condition 1: Animals crossed danger line
    if (lowestY >= DANGER_Y) {
      isGameOverRef.current = true;
      sounds.playDefeat();
      setTimeout(() => {
        onDefeat(scoreRef.current);
      }, 600);
      return;
    }

    // Defeat Condition 2: Out of shots (and no active projectile or falling pieces)
    if (shotsRef.current <= 0 && (!projectileRef.current || !projectileRef.current.active)) {
      setTimeout(() => {
        if (!isGameOverRef.current && fallingPiecesRef.current.length === 0) {
          isGameOverRef.current = true;
          sounds.playDefeat();
          onDefeat(scoreRef.current);
        }
      }, 500);
    }
  };

  // Pointer Aiming Event Handlers (Glitch-free touch and mouse tracking)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || isGameOverRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isAimingRef.current = true;
    updateAimAngle(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAimingRef.current) return;
    updateAimAngle(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (!isAimingRef.current) return;
    isAimingRef.current = false;
    fireProjectile();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isAimingRef.current = false;
  };

  const updateAimAngle = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = STAGE_WIDTH / rect.width;
    const scaleY = STAGE_HEIGHT / rect.height;

    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    // Angle from monkey launcher center to touch point
    const dx = px - LAUNCHER_X;
    const dy = py - LAUNCHER_Y;

    const minAngle = (-166 * Math.PI) / 180;
    const maxAngle = (-14 * Math.PI) / 180;

    let angle = Math.atan2(dy, dx);
    if (dy >= -10) {
      // Finger is near or below the monkey: clamp smoothly to left or right upward diagonal
      angle = dx < 0 ? minAngle : maxAngle;
    } else {
      angle = Math.max(minAngle, Math.min(maxAngle, angle));
    }

    aimAngleRef.current = angle;
    setAimAngle(angle);
  };

  // Main Game Loop (Physics, Collision & Render)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      if (!isPaused) {
        // Decay monkey cannon recoil
        if (recoilRef.current > 0) {
          recoilRef.current = Math.max(0, recoilRef.current - 0.06);
        }

        // 1. Update Projectile Physics (Sub-stepping for precise collision)
        const proj = projectileRef.current;
        if (proj && proj.active) {
          const subSteps = 6;
          const subVx = proj.vx / subSteps;
          const subVy = proj.vy / subSteps;

          for (let s = 0; s < subSteps; s++) {
            proj.x += subVx;
            proj.y += subVy;

            // Trail
            particlesRef.current.emitTrail(proj.x, proj.y, ANIMAL_DEFS[proj.type].primaryColor);

            // Left wall bounce
            if (proj.x - proj.radius <= 10) {
              proj.x = 10 + proj.radius;
              proj.vx = -proj.vx;
              sounds.playBounce();
            }
            // Right wall bounce
            else if (proj.x + proj.radius >= STAGE_WIDTH - 10) {
              proj.x = STAGE_WIDTH - 10 - proj.radius;
              proj.vx = -proj.vx;
              sounds.playBounce();
            }

            // Ceiling collision
            if (proj.y - proj.radius <= START_Y) {
              handleProjectileAttachment(proj, -1, -1);
              break;
            }

            // Check collision with active grid pieces
            let hit = false;
            const grid = gridRef.current;
            for (let r = 0; r < grid.length; r++) {
              for (let c = 0; c < grid[r].length; c++) {
                const piece = grid[r][c];
                if (piece) {
                  const dist = Math.hypot(proj.x - piece.x, proj.y - piece.y);
                  if (dist <= proj.radius + piece.radius - 2) {
                    hit = true;
                    handleProjectileAttachment(proj, piece.row, piece.col);
                    break;
                  }
                }
              }
              if (hit) break;
            }
            if (hit) break;
          }
        }

        // 2. Update Falling Detached Pieces
        for (let i = fallingPiecesRef.current.length - 1; i >= 0; i--) {
          const fp = fallingPiecesRef.current[i];
          fp.vy += 0.45; // realistic gravity
          fp.x += fp.vx;
          fp.y += fp.vy;
          fp.rotation += fp.vRot;

          // Screen floor bounce
          if (fp.y >= STAGE_HEIGHT - 30) {
            fp.y = STAGE_HEIGHT - 30;
            fp.vy = -fp.vy * 0.45;
            fp.vx *= 0.8;
            fp.bounces++;
            if (fp.bounces >= 2) {
              const def = ANIMAL_DEFS[fp.type];
              particlesRef.current.emitBurst(fp.x, fp.y, def.primaryColor, 12);
              fallingPiecesRef.current.splice(i, 1);
            }
          }
        }

        // 3. Update Grid Piece Animations (e.g. squish settle)
        const grid = gridRef.current;
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            const p = grid[r][c];
            if (p && p.scale > 1.0) {
              p.scale = Math.max(1.0, p.scale - dt * 2.5);
            }
          }
        }

        // 4. Update Particle System
        particlesRef.current.update();
      }

      // 5. Render Scene
      renderScene(ctx);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPaused, level.cols, level.rows]);

  // Main Canvas Rendering
  const renderScene = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    // Lush Jungle Canopy Background
    renderBackground(ctx);

    // Danger Line Warning
    renderDangerZone(ctx);

    // Render Grid Pieces
    const grid = gridRef.current;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const piece = grid[r][c];
        if (piece) {
          drawAnimalPiece(
            ctx,
            piece.type,
            piece.x,
            piece.y,
            piece.radius,
            piece.scale,
            piece.opacity
          );
        }
      }
    }

    // Render Aiming Trajectory & Ghost Preview
    if (isAimingRef.current && (!projectileRef.current || !projectileRef.current.active)) {
      renderTrajectory(ctx);
    }

    // Render In-Flight Projectile
    const proj = projectileRef.current;
    if (proj && proj.active) {
      drawAnimalPiece(ctx, proj.type, proj.x, proj.y, proj.radius, 1.0, 1.0);
    }

    // Render Falling Detached Pieces
    for (const fp of fallingPiecesRef.current) {
      drawAnimalPiece(
        ctx,
        fp.type,
        fp.x,
        fp.y,
        fp.radius,
        fp.scale,
        fp.opacity,
        fp.rotation
      );
    }

    // Render Particles & Floating Score Flyouts
    particlesRef.current.render(ctx);

    // Render Monkey Cannon (Aiming Turret & Loaded Animal in Mouth)
    renderMonkeyCannon(ctx);
  };

  // Background Theme
  const renderBackground = (ctx: CanvasRenderingContext2D) => {
    // Deep Jungle Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, STAGE_HEIGHT);
    bgGrad.addColorStop(0, '#064E3B'); // deep emerald
    bgGrad.addColorStop(0.4, '#065F46');
    bgGrad.addColorStop(0.85, '#042F2E');
    bgGrad.addColorStop(1, '#022C22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    // Decorative Jungle Vines / Leaves at top border
    ctx.fillStyle = '#022C22';
    ctx.beginPath();
    ctx.arc(40, START_Y - 20, 50, 0, Math.PI);
    ctx.arc(140, START_Y - 25, 60, 0, Math.PI);
    ctx.arc(260, START_Y - 22, 65, 0, Math.PI);
    ctx.arc(380, START_Y - 26, 55, 0, Math.PI);
    ctx.fill();

    // Bamboo Branch Ceiling
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, START_Y - 14, STAGE_WIDTH, 14);

    ctx.fillStyle = '#4ADE80';
    for (let x = 30; x < STAGE_WIDTH; x += 60) {
      ctx.fillRect(x, START_Y - 14, 4, 14);
    }

    // Left and Right Bamboo Wall Borders
    ctx.fillStyle = 'rgba(22, 101, 52, 0.4)';
    ctx.fillRect(0, 0, 10, STAGE_HEIGHT);
    ctx.fillRect(STAGE_WIDTH - 10, 0, 10, STAGE_HEIGHT);
  };

  // Danger Line Warning
  const renderDangerZone = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, DANGER_Y);
    ctx.lineTo(STAGE_WIDTH - 12, DANGER_Y);
    ctx.stroke();

    // Subtle pulsating warning label
    ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.font = "800 11px 'Fredoka', sans-serif";
    ctx.textAlign = 'right';
    ctx.fillText('DANGER LINE', STAGE_WIDTH - 20, DANGER_Y - 6);
    ctx.restore();
  };

  // Trajectory Dotted Aim Line & Ghost Landing Preview
  const renderTrajectory = (ctx: CanvasRenderingContext2D) => {
    const trajectory = calculateTrajectory(aimAngleRef.current);
    const { points, targetPos } = trajectory;

    ctx.save();
    ctx.setLineDash([5, 8]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Glow dot particles along trajectory
    ctx.setLineDash([]);
    for (let i = 0; i < points.length; i++) {
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ghost Landing Preview
    if (targetPos) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawAnimalPiece(ctx, currentAnimalRef.current, targetPos.x, targetPos.y, BUBBLE_RADIUS, 0.95, 0.65);

      // Target ring
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetPos.x, targetPos.y, BUBBLE_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  // Monkey Cannon: Animated monkey head that aims and fires from its open mouth
  const renderMonkeyCannon = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // 1. Jungle Carved Stone Base Pedestal
    const baseGrad = ctx.createRadialGradient(
      LAUNCHER_X,
      LAUNCHER_Y + 12,
      6,
      LAUNCHER_X,
      LAUNCHER_Y + 12,
      48
    );
    baseGrad.addColorStop(0, '#064E3B');
    baseGrad.addColorStop(0.7, '#022c22');
    baseGrad.addColorStop(1, '#065f46');

    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(LAUNCHER_X, LAUNCHER_Y + 14, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    // Bamboo notches around the base ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const bx = LAUNCHER_X + Math.cos(a) * 43;
      const by = LAUNCHER_Y + 14 + Math.sin(a) * 43;
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Rotating Monkey Head Turret
    ctx.save();
    ctx.translate(LAUNCHER_X, LAUNCHER_Y);
    // Rotate to aim angle (the monkey face looks towards the trajectory)
    ctx.rotate(aimAngle + Math.PI / 2);

    // Apply recoil animation (kicks back down the local +Y axis and squashes)
    const recoil = recoilRef.current;
    const recoilKick = recoil * 9;
    const scaleX = 1 + recoil * 0.12;
    const scaleY = 1 - recoil * 0.16;
    ctx.translate(0, recoilKick);
    ctx.scale(scaleX, scaleY);

    // Monkey Ears
    // Left Ear
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(-33, 2, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FBCFE8'; // pink inner ear
    ctx.beginPath();
    ctx.arc(-33, 2, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Right Ear
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(33, 2, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FBCFE8'; // pink inner ear
    ctx.beginPath();
    ctx.arc(33, 2, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Main Head Dome
    const furGrad = ctx.createRadialGradient(0, -6, 6, 0, -6, 34);
    furGrad.addColorStop(0, '#B45309');
    furGrad.addColorStop(1, '#78350F');
    ctx.fillStyle = furGrad;
    ctx.beginPath();
    ctx.arc(0, -5, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#451A03';
    ctx.stroke();

    // Cute hair tuft at the top
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.quadraticCurveTo(0, -44, 6, -34);
    ctx.closePath();
    ctx.fill();

    // Peach Face Mask (Muzzle & Eye area)
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(-10, -11, 13, 0, Math.PI * 2);
    ctx.arc(10, -11, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.arc(-18, 0, 5.5, 0, Math.PI * 2);
    ctx.arc(18, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Cartoon Eyes
    // Sclera (whites)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-10, -13, 7, 8.5, 0, 0, Math.PI * 2);
    ctx.ellipse(10, -13, 7, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#451A03';
    ctx.stroke();

    // Pupils looking along the barrel aim axis
    const eyeLookY = recoil > 0 ? -17 : -15;
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(-10, eyeLookY, 4, 0, Math.PI * 2);
    ctx.arc(10, eyeLookY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Twinkle catchlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-11.5, eyeLookY - 1.5, 1.6, 0, Math.PI * 2);
    ctx.arc(8.5, eyeLookY - 1.5, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows (raise dynamically during recoil/fire!)
    const browY = recoil > 0 ? -24 : -22;
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-10, browY, 6, Math.PI * 0.9, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, browY, 6, Math.PI * 1.1, Math.PI * 2.1);
    ctx.stroke();

    // Button Nose
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.ellipse(0, -4, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. The Monkey's Open Mouth (Cannon Barrel / Muzzle!)
    // Wide open circular/oval mouth through which the animal fires!
    const mouthW = 20 + recoil * 6;
    const mouthH = 19 + recoil * 6;
    const mouthY = 7;

    // Cannon gold collar rim around mouth
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, mouthW + 4, mouthH + 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Deep dark mouth cave
    ctx.fillStyle = '#2A0800';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink tongue
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthH * 0.45, mouthW * 0.55, mouthH * 0.45, 0, 0, Math.PI);
    ctx.fill();

    // 4. Animal Projectile Loaded Inside the Monkey's Open Mouth!
    if (!projectileRef.current || !projectileRef.current.active) {
      drawAnimalPiece(
        ctx,
        currentAnimalRef.current,
        0,
        mouthY,
        BUBBLE_RADIUS * 1.05,
        1.0,
        1.0
      );
    }

    // Muzzle blast flash when firing
    if (recoil > 0.3) {
      ctx.fillStyle = `rgba(253, 224, 71, ${recoil * 0.85})`;
      ctx.beginPath();
      ctx.arc(0, mouthY - 14, 20 * recoil, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore monkey head
    ctx.restore(); // Restore base
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Interactive Game Canvas */}
      <canvas
        ref={canvasRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        id="animal-shooter-canvas"
        className="w-full max-w-[440px] h-auto max-h-[82vh] aspect-[440/740] rounded-3xl shadow-2xl shadow-black/80 border-4 border-emerald-800/80 cursor-crosshair touch-none select-none bg-stone-950"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />

      {/* Launcher Bottom Dock: Next Animal Preview, Monkey Cannon Fire Button & Swap */}
      <div className="absolute bottom-2 sm:bottom-3 flex items-center justify-between w-[94%] max-w-[420px] px-3 py-2 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-emerald-500/30 shadow-xl text-xs pointer-events-auto">
        {/* Next Animal Queue Preview */}
        <div className="flex items-center gap-2">
          <div
            id="next-animal-bubble-preview"
            onClick={handleSwapAnimal}
            title="Tap to Swap Animal"
            className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 border-amber-400/90 bg-stone-800 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <NextBubblePreview type={nextAnimalState} />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-black rounded-full px-1 text-black shadow">
              ⇄
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400">Next</span>
            <span className="font-extrabold text-white text-xs capitalize truncate max-w-[65px]">
              {ANIMAL_DEFS[nextAnimalState].name}
            </span>
          </div>
        </div>

        {/* Dedicated Monkey Cannon Fire Button */}
        <button
          id="monkey-fire-button"
          onClick={fireProjectile}
          disabled={Boolean(projectileRef.current?.active) || shotsRemaining <= 0}
          title="Fire from Monkey Cannon Mouth!"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-black text-xs shadow-lg shadow-orange-950/50 transition-all cursor-pointer border border-amber-300/40"
        >
          <span className="text-base leading-none">🐵</span>
          <span className="uppercase tracking-wider font-['Fredoka']">FIRE!</span>
        </button>

        {/* Swap Trigger Button */}
        <button
          id="swap-animal-button"
          onClick={handleSwapAnimal}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 active:scale-95 text-stone-200 border border-stone-700 font-bold text-[11px] shadow transition cursor-pointer"
          title="Swap with Next Animal"
        >
          <span>Swap</span>
          <span className="text-xs">↺</span>
        </button>
      </div>
    </div>
  );
};

/** Mini preview canvas for the Next Animal piece in the dock */
const NextBubblePreview: React.FC<{ type: AnimalType }> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 40, 40);
    drawAnimalPiece(ctx, type, 20, 20, 16, 1.0, 1.0);
  }, [type]);

  return <canvas ref={canvasRef} width={40} height={40} className="w-8 h-8 pointer-events-none" />;
};
