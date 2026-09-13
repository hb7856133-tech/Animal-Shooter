import { FloatingText, Particle } from '../types';

export class ParticleSystem {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  public emitBurst(x: number, y: number, color: string, count: number = 18) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2.0 + Math.random() * 5.0;
      const shapeRand = Math.random();
      const type = shapeRand > 0.6 ? 'star' : shapeRand > 0.3 ? 'sparkle' : 'circle';

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 28 + Math.floor(Math.random() * 20),
        type,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  public emitTrail(x: number, y: number, color: string) {
    if (Math.random() > 0.6) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 2 + Math.random() * 2.5,
      color,
      alpha: 0.8,
      life: 0,
      maxLife: 15,
      type: 'circle',
      rotation: 0,
      vRot: 0,
    });
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#FDE047') {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale: 1.3,
      vy: -1.8,
      duration: 45,
      elapsed: 0,
    });
  }

  public update() {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.elapsed++;
      ft.y += ft.vy;
      ft.vy *= 0.96;
      if (ft.elapsed < 10) {
        ft.scale = 1.0 + (10 - ft.elapsed) * 0.04;
      } else {
        ft.scale = 1.0;
      }
      ft.alpha = Math.max(0, 1 - (ft.elapsed / ft.duration));

      if (ft.elapsed >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Draw particles
    for (const p of this.particles) {
      if (p.alpha <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'star') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const spikes = 4;
        const outer = p.radius * 2;
        const inner = p.radius * 0.8;
        let rot = (Math.PI / 2) * 3;
        let x = 0;
        let y = 0;
        const step = Math.PI / spikes;
        ctx.moveTo(0, -outer);
        for (let j = 0; j < spikes; j++) {
          x = Math.cos(rot) * outer;
          y = Math.sin(rot) * outer;
          ctx.lineTo(x, y);
          rot += step;
          x = Math.cos(rot) * inner;
          y = Math.sin(rot) * inner;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      if (ft.alpha <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = "900 20px 'Nunito', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.strokeText(ft.text, 0, 0);

      // Text Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }
  }
}
