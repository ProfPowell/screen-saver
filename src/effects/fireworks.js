/**
 * @fileoverview Fireworks effect - Colorful particle explosions.
 */

import { Effect } from '../effect.js';
import { normalizeDeltaTime } from '../utils/timing.js';

/** Firework colors */
const COLORS = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
  '#00ffff', '#0000ff', '#ff00ff', '#ffffff',
  '#ff69b4', '#ffd700'
];

/**
 * Fireworks effect with particle explosions.
 * Canvas-based with rockets and colorful bursts.
 */
class FireworksEffect extends Effect {
  static requiresText = false;

  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.rockets = [];
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
    this.launchTimer = 0;
  }

  start() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fireworks-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    if (this.text) {
      this.textOverlay = document.createElement('div');
      this.textOverlay.className = 'fireworks-text';
      this.textOverlay.textContent = this.text;
      this.container.appendChild(this.textOverlay);
    }

    const style = document.createElement('style');
    style.textContent = `
      .fireworks-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .fireworks-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(255, 200, 100, 0.8), 0 0 40px rgba(255, 100, 50, 0.6);
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    if (this.reducedMotion) {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  launchRocket() {
    const x = Math.random() * this.canvas.width;
    this.rockets.push({
      x,
      y: this.canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 4 + 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      targetY: Math.random() * this.canvas.height * 0.5 + 50
    });
  }

  explode(rocket) {
    const particleCount = 80 + Math.floor(Math.random() * 40);
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
      const velocity = Math.random() * 4 + 2;
      this.particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: rocket.color,
        life: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = normalizeDeltaTime(currentTime, this.lastTime);
    this.lastTime = currentTime;

    // Fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Launch new rockets
    this.launchTimer += deltaTime * this.speed;
    if (this.launchTimer > 30) {
      this.launchRocket();
      this.launchTimer = 0;
    }

    // Update and draw rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx * deltaTime * this.speed;
      r.y += r.vy * deltaTime * this.speed;
      r.vy += 0.1 * deltaTime * this.speed; // gravity

      // Draw rocket trail
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = r.color;
      this.ctx.fill();

      // Explode at target height or when slowing
      if (r.y <= r.targetY || r.vy > -2) {
        this.explode(r);
        this.rockets.splice(i, 1);
      }
    }

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaTime * this.speed;
      p.y += p.vy * deltaTime * this.speed;
      p.vy += 0.05 * deltaTime * this.speed; // gravity
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life -= p.decay * deltaTime * this.speed;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    window.removeEventListener('resize', this._boundResize);
    super.destroy();
  }

  updateText(text) {
    super.updateText(text);
    if (this.textOverlay) {
      this.textOverlay.textContent = text;
    }
  }
}

export { FireworksEffect };
export default FireworksEffect;
