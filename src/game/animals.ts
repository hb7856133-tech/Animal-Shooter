import { AnimalDef, AnimalType } from '../types';

export const ANIMAL_DEFS: Record<AnimalType, AnimalDef> = {
  panda: {
    id: 'panda',
    name: 'Panda',
    primaryColor: '#F8FAFC',
    secondaryColor: '#1E293B',
    accentColor: '#10B981',
    textColor: '#0F172A',
  },
  tiger: {
    id: 'tiger',
    name: 'Tiger',
    primaryColor: '#F97316',
    secondaryColor: '#C2410C',
    accentColor: '#FEF08A',
    textColor: '#FFFFFF',
  },
  lion: {
    id: 'lion',
    name: 'Lion',
    primaryColor: '#FBBF24',
    secondaryColor: '#D97706',
    accentColor: '#92400E',
    textColor: '#78350F',
  },
  frog: {
    id: 'frog',
    name: 'Frog',
    primaryColor: '#22C55E',
    secondaryColor: '#15803D',
    accentColor: '#BBF7D0',
    textColor: '#14532D',
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    primaryColor: '#EA580C',
    secondaryColor: '#9A3412',
    accentColor: '#FED7AA',
    textColor: '#FFFFFF',
  },
  monkey: {
    id: 'monkey',
    name: 'Monkey',
    primaryColor: '#A16207',
    secondaryColor: '#713F12',
    accentColor: '#FDE68A',
    textColor: '#FFFFFF',
  },
  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    primaryColor: '#F472B6',
    secondaryColor: '#DB2777',
    accentColor: '#FCE7F3',
    textColor: '#831843',
  },
  elephant: {
    id: 'elephant',
    name: 'Elephant',
    primaryColor: '#60A5FA',
    secondaryColor: '#2563EB',
    accentColor: '#DBEAFE',
    textColor: '#1E3A8A',
  },
  rock: {
    id: 'rock',
    name: 'Rock',
    primaryColor: '#64748B',
    secondaryColor: '#334155',
    accentColor: '#94A3B8',
    textColor: '#F1F5F9',
    isSpecial: true,
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow Star',
    primaryColor: '#A855F7',
    secondaryColor: '#EC4899',
    accentColor: '#FACC15',
    textColor: '#FFFFFF',
    isSpecial: true,
  },
  bomb: {
    id: 'bomb',
    name: 'Bomb Coconut',
    primaryColor: '#374151',
    secondaryColor: '#1F2937',
    accentColor: '#EF4444',
    textColor: '#FFFFFF',
    isSpecial: true,
  },
};

/**
 * Draws a gorgeous, highly recognizable round animal piece on HTML5 Canvas.
 */
export function drawAnimalPiece(
  ctx: CanvasRenderingContext2D,
  type: AnimalType,
  x: number,
  y: number,
  radius: number,
  scale: number = 1.0,
  opacity: number = 1.0,
  rotation: number = 0
) {
  if (scale <= 0.01 || opacity <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const r = radius;

  // Drop shadow under the bubble piece
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 2, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fill();
  ctx.restore();

  // Outer border & base body circle
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip(); // Keep everything inside the round piece

  switch (type) {
    case 'panda':
      renderPanda(ctx, r);
      break;
    case 'tiger':
      renderTiger(ctx, r);
      break;
    case 'lion':
      renderLion(ctx, r);
      break;
    case 'frog':
      renderFrog(ctx, r);
      break;
    case 'fox':
      renderFox(ctx, r);
      break;
    case 'monkey':
      renderMonkey(ctx, r);
      break;
    case 'rabbit':
      renderRabbit(ctx, r);
      break;
    case 'elephant':
      renderElephant(ctx, r);
      break;
    case 'rock':
      renderRock(ctx, r);
      break;
    case 'rainbow':
      renderRainbow(ctx, r);
      break;
    case 'bomb':
      renderBomb(ctx, r);
      break;
  }

  // 3D Glass / Sphere Sheen & Rim Highlight
  renderBubbleGloss(ctx, r);

  ctx.restore();
}

/** Glossy overlay for arcade mobile feel */
function renderBubbleGloss(ctx: CanvasRenderingContext2D, r: number) {
  // Top-left curved highlight
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.32, r * 0.38, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(-r * 0.4, -r * 0.4, 0, 0);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Subtle bottom rim glow
  ctx.beginPath();
  ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();
  ctx.restore();
}

function renderPanda(ctx: CanvasRenderingContext2D, r: number) {
  // White face base
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(1, '#E2E8F0');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Black ears
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-r * 0.65, -r * 0.55, r * 0.32, 0, Math.PI * 2);
  ctx.arc(r * 0.65, -r * 0.55, r * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Re-draw face overlap
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
  ctx.fill();

  // Panda eye patches (angled black ovals)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.08, r * 0.22, r * 0.28, -0.3, 0, Math.PI * 2);
  ctx.ellipse(r * 0.35, -r * 0.08, r * 0.22, r * 0.28, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Sparkling eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.32, -r * 0.12, r * 0.08, 0, Math.PI * 2);
  ctx.arc(r * 0.32, -r * 0.12, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Cute black nose & mouth
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.22, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(-r * 0.08, r * 0.35, r * 0.09, 0.1, Math.PI * 0.9);
  ctx.arc(r * 0.08, r * 0.35, r * 0.09, 0.1, Math.PI * 0.9);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = r * 0.06;
  ctx.stroke();

  // Pink blush
  ctx.fillStyle = 'rgba(244, 114, 182, 0.5)';
  ctx.beginPath();
  ctx.arc(-r * 0.58, r * 0.22, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.58, r * 0.22, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function renderTiger(ctx: CanvasRenderingContext2D, r: number) {
  // Vibrant Orange base
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#FB923C');
  bgGrad.addColorStop(1, '#EA580C');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Ears
  ctx.fillStyle = '#C2410C';
  ctx.beginPath();
  ctx.arc(-r * 0.62, -r * 0.52, r * 0.28, 0, Math.PI * 2);
  ctx.arc(r * 0.62, -r * 0.52, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(-r * 0.62, -r * 0.52, r * 0.15, 0, Math.PI * 2);
  ctx.arc(r * 0.62, -r * 0.52, r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Tiger forehead stripes
  ctx.fillStyle = '#431407';
  ctx.beginPath();
  // Center stripe
  ctx.moveTo(0, -r * 0.7);
  ctx.lineTo(-r * 0.08, -r * 0.4);
  ctx.lineTo(r * 0.08, -r * 0.4);
  ctx.closePath();
  ctx.fill();
  // Side stripes
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, -r * 0.4);
  ctx.lineTo(-r * 0.18, -r * 0.3);
  ctx.lineTo(-r * 0.38, -r * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.4, -r * 0.4);
  ctx.lineTo(r * 0.18, -r * 0.3);
  ctx.lineTo(r * 0.38, -r * 0.2);
  ctx.closePath();
  ctx.fill();

  // White muzzle
  ctx.fillStyle = '#FFF7ED';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.35, r * 0.42, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiger eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.05, r * 0.16, r * 0.2, 0, 0, Math.PI * 2);
  ctx.ellipse(r * 0.32, -r * 0.05, r * 0.16, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.arc(r * 0.3, -r * 0.05, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.09, r * 0.04, 0, Math.PI * 2);
  ctx.arc(r * 0.32, -r * 0.09, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Pink nose
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.28);
  ctx.lineTo(-r * 0.12, r * 0.18);
  ctx.lineTo(r * 0.12, r * 0.18);
  ctx.closePath();
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, r * 0.32);
  ctx.lineTo(-r * 0.55, r * 0.28);
  ctx.moveTo(-r * 0.2, r * 0.4);
  ctx.lineTo(-r * 0.52, r * 0.44);
  ctx.moveTo(r * 0.2, r * 0.32);
  ctx.lineTo(r * 0.55, r * 0.28);
  ctx.moveTo(r * 0.2, r * 0.4);
  ctx.lineTo(r * 0.52, r * 0.44);
  ctx.stroke();
}

function renderLion(ctx: CanvasRenderingContext2D, r: number) {
  // Fluffy mane border
  ctx.fillStyle = '#B45309';
  const maneCount = 10;
  for (let i = 0; i < maneCount; i++) {
    const angle = (i * Math.PI * 2) / maneCount;
    const mx = Math.cos(angle) * r * 0.75;
    const my = Math.sin(angle) * r * 0.75;
    ctx.beginPath();
    ctx.arc(mx, my, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden face
  const bgGrad = ctx.createRadialGradient(0, -r * 0.1, 0, 0, 0, r * 0.75);
  bgGrad.addColorStop(0, '#FDE047');
  bgGrad.addColorStop(1, '#F59E0B');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
  ctx.fill();

  // Rounded lion ears
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(-r * 0.5, -r * 0.45, r * 0.2, 0, Math.PI * 2);
  ctx.arc(r * 0.5, -r * 0.45, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // White snout
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.25, r * 0.36, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big friendly eyes
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.08, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.28, -r * 0.08, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.12, r * 0.045, 0, Math.PI * 2);
  ctx.arc(r * 0.31, -r * 0.12, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Lion heart nose
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.26);
  ctx.lineTo(-r * 0.14, r * 0.14);
  ctx.lineTo(r * 0.14, r * 0.14);
  ctx.closePath();
  ctx.fill();

  // Proud smile
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(-r * 0.1, r * 0.32, r * 0.1, 0.1, Math.PI * 0.9);
  ctx.arc(r * 0.1, r * 0.32, r * 0.1, 0.1, Math.PI * 0.9);
  ctx.stroke();
}

function renderFrog(ctx: CanvasRenderingContext2D, r: number) {
  // Vibrant Green base
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#4ADE80');
  bgGrad.addColorStop(1, '#16A34A');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Frog bulging eyes at top
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(-r * 0.42, -r * 0.42, r * 0.32, 0, Math.PI * 2);
  ctx.arc(r * 0.42, -r * 0.42, r * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Big white eyeballs
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.4, -r * 0.4, r * 0.22, 0, Math.PI * 2);
  ctx.arc(r * 0.4, -r * 0.4, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Pupils looking slightly center
  ctx.fillStyle = '#064E3B';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.38, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.35, -r * 0.38, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.32, -r * 0.42, r * 0.045, 0, Math.PI * 2);
  ctx.arc(r * 0.38, -r * 0.42, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Light green throat
  ctx.fillStyle = '#DCFCE7';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.4, r * 0.5, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful wide frog smile
  ctx.strokeStyle = '#14532D';
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(0, r * 0.15, r * 0.45, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Pink blush circles
  ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
  ctx.beginPath();
  ctx.arc(-r * 0.52, r * 0.25, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.52, r * 0.25, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function renderFox(ctx: CanvasRenderingContext2D, r: number) {
  // Rich warm red/orange body
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#FB923C');
  bgGrad.addColorStop(1, '#C2410C');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Pointed fox ears
  ctx.fillStyle = '#7C2D12';
  ctx.beginPath();
  ctx.moveTo(-r * 0.75, -r * 0.2);
  ctx.lineTo(-r * 0.5, -r * 0.85);
  ctx.lineTo(-r * 0.15, -r * 0.45);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(r * 0.75, -r * 0.2);
  ctx.lineTo(r * 0.5, -r * 0.85);
  ctx.lineTo(r * 0.15, -r * 0.45);
  ctx.closePath();
  ctx.fill();

  // White inner ears
  ctx.fillStyle = '#FFF7ED';
  ctx.beginPath();
  ctx.moveTo(-r * 0.65, -r * 0.25);
  ctx.lineTo(-r * 0.5, -r * 0.7);
  ctx.lineTo(-r * 0.25, -r * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.65, -r * 0.25);
  ctx.lineTo(r * 0.5, -r * 0.7);
  ctx.lineTo(r * 0.25, -r * 0.45);
  ctx.closePath();
  ctx.fill();

  // Fox white cheeks/muzzle
  ctx.fillStyle = '#FFF7ED';
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, r * 0.1);
  ctx.quadraticCurveTo(-r * 0.2, r * 0.35, 0, r * 0.65);
  ctx.quadraticCurveTo(r * 0.2, r * 0.35, r * 0.7, r * 0.1);
  ctx.quadraticCurveTo(r * 0.4, r * 0.8, 0, r * 0.85);
  ctx.quadraticCurveTo(-r * 0.4, r * 0.8, -r * 0.7, r * 0.1);
  ctx.fill();

  // Clever fox eyes
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.05, r * 0.12, r * 0.15, -0.2, 0, Math.PI * 2);
  ctx.ellipse(r * 0.32, -r * 0.05, r * 0.12, r * 0.15, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.08, r * 0.04, 0, Math.PI * 2);
  ctx.arc(r * 0.34, -r * 0.08, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Cute black nose tip
  ctx.fillStyle = '#09090B';
  ctx.beginPath();
  ctx.arc(0, r * 0.5, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
}

function renderMonkey(ctx: CanvasRenderingContext2D, r: number) {
  // Rich Brown coat
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#B45309');
  bgGrad.addColorStop(1, '#78350F');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Big monkey ears protruding from sides
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.arc(-r * 0.7, 0, r * 0.28, 0, Math.PI * 2);
  ctx.arc(r * 0.7, 0, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.arc(-r * 0.7, 0, r * 0.16, 0, Math.PI * 2);
  ctx.arc(r * 0.7, 0, r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Heart-shaped peach face patch
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.arc(r * 0.25, -r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, r * 0.28, r * 0.45, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curious round eyes
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(-r * 0.24, -r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.24, -r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.14, r * 0.045, 0, Math.PI * 2);
  ctx.arc(r * 0.26, -r * 0.14, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.arc(-r * 0.08, r * 0.16, r * 0.035, 0, Math.PI * 2);
  ctx.arc(r * 0.08, r * 0.16, r * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Wide monkey grin
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = r * 0.055;
  ctx.beginPath();
  ctx.arc(0, r * 0.25, r * 0.25, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function renderRabbit(ctx: CanvasRenderingContext2D, r: number) {
  // Soft Rose Pink & Cream base
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#FCE7F3');
  bgGrad.addColorStop(1, '#F472B6');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Tall upright rabbit ears
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.ellipse(-r * 0.36, -r * 0.65, r * 0.18, r * 0.45, -0.15, 0, Math.PI * 2);
  ctx.ellipse(r * 0.36, -r * 0.65, r * 0.18, r * 0.45, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FDF2F8';
  ctx.beginPath();
  ctx.ellipse(-r * 0.36, -r * 0.65, r * 0.09, r * 0.32, -0.15, 0, Math.PI * 2);
  ctx.ellipse(r * 0.36, -r * 0.65, r * 0.09, r * 0.32, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // White face cheeks
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.32, r * 0.45, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sweet ruby/dark eyes
  ctx.fillStyle = '#831843';
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.02, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.28, -r * 0.02, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.06, r * 0.045, 0, Math.PI * 2);
  ctx.arc(r * 0.31, -r * 0.06, r * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Pink nose
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.2, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute buck teeth
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-r * 0.08, r * 0.3, r * 0.07, r * 0.12);
  ctx.fillRect(r * 0.01, r * 0.3, r * 0.07, r * 0.12);
  ctx.strokeStyle = '#DB2777';
  ctx.lineWidth = 1;
  ctx.strokeRect(-r * 0.08, r * 0.3, r * 0.07, r * 0.12);
  ctx.strokeRect(r * 0.01, r * 0.3, r * 0.07, r * 0.12);
}

function renderElephant(ctx: CanvasRenderingContext2D, r: number) {
  // Slate / Periwinkle Blue body
  const bgGrad = ctx.createRadialGradient(0, -r * 0.2, 0, 0, 0, r);
  bgGrad.addColorStop(0, '#93C5FD');
  bgGrad.addColorStop(1, '#3B82F6');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Big elephant ears on the sides
  ctx.fillStyle = '#60A5FA';
  ctx.beginPath();
  ctx.arc(-r * 0.65, -r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.arc(r * 0.65, -r * 0.1, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DBEAFE';
  ctx.beginPath();
  ctx.arc(-r * 0.65, -r * 0.1, r * 0.2, 0, Math.PI * 2);
  ctx.arc(r * 0.65, -r * 0.1, r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Main head
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.fill();

  // Big friendly eyes
  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.15, r * 0.11, 0, Math.PI * 2);
  ctx.arc(r * 0.3, -r * 0.15, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-r * 0.27, -r * 0.19, r * 0.04, 0, Math.PI * 2);
  ctx.arc(r * 0.33, -r * 0.19, r * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Curved elephant trunk in center!
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.05);
  ctx.quadraticCurveTo(-r * 0.05, r * 0.45, r * 0.25, r * 0.42);
  ctx.stroke();

  ctx.strokeStyle = '#60A5FA';
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.moveTo(0, r * 0.05);
  ctx.quadraticCurveTo(-r * 0.05, r * 0.45, r * 0.25, r * 0.42);
  ctx.stroke();

  // Cute tusks
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-r * 0.18, r * 0.32, r * 0.06, r * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function renderRock(ctx: CanvasRenderingContext2D, r: number) {
  // Ancient mossy stone sphere
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
  grad.addColorStop(0, '#94A3B8');
  grad.addColorStop(0.7, '#475569');
  grad.addColorStop(1, '#1E293B');
  ctx.fillStyle = grad;
  ctx.fill();

  // Cracks and stone facets
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, -r * 0.3);
  ctx.lineTo(-r * 0.1, -r * 0.1);
  ctx.lineTo(r * 0.15, -r * 0.4);
  ctx.moveTo(-r * 0.1, -r * 0.1);
  ctx.lineTo(r * 0.3, r * 0.25);
  ctx.lineTo(r * 0.55, r * 0.1);
  ctx.stroke();

  // Moss patch on top
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.6, r * 0.2, 0, Math.PI * 2);
  ctx.arc(r * 0.1, -r * 0.65, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function renderRainbow(ctx: CanvasRenderingContext2D, r: number) {
  // Shimmering multi-color concentric swirl
  const colors = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#8B5CF6'];
  for (let i = 0; i < colors.length; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 - (i * 0.12)), 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }

  // Sparkling golden star in center
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#FDE047';
  ctx.shadowBlur = 10;
  drawStar(ctx, 0, 0, 5, r * 0.38, r * 0.18);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function renderBomb(ctx: CanvasRenderingContext2D, r: number) {
  // Dark metallic coconut bomb
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
  grad.addColorStop(0, '#4B5563');
  grad.addColorStop(0.6, '#1F2937');
  grad.addColorStop(1, '#030712');
  ctx.fillStyle = grad;
  ctx.fill();

  // Glowing warning skull / crosshairs / flame
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FEF08A';
  ctx.font = `bold ${Math.round(r * 0.42)}px 'Fredoka', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💣', 0, 0);

  // Sparking fuse at top
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.6);
  ctx.quadraticCurveTo(r * 0.3, -r * 0.85, r * 0.1, -r * 0.95);
  ctx.stroke();

  // Flame spark
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(r * 0.1, -r * 0.95, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}
