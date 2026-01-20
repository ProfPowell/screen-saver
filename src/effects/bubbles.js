/**
 * @fileoverview Bubbles effect - Floating translucent bubbles.
 */

import { Effect } from '../effect.js';
import { normalizeDeltaTime } from '../utils/timing.js';

/** Number of bubbles */
const BUBBLE_COUNT = 30;

/** Bubble colors with transparency */
const COLORS = [
  'rgba(255, 100, 100, 0.3)',
  'rgba(100, 255, 100, 0.3)',
  'rgba(100, 100, 255, 0.3)',
  'rgba(255, 255, 100, 0.3)',
  'rgba(255, 100, 255, 0.3)',
  'rgba(100, 255, 255, 0.3)',
];

/**
 * Floating bubbles effect.
 * Canvas-based with translucent gradient bubbles.
 */
class BubblesEffect extends Effect {
  static requiresText = false;

  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.bubbles = [];
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
  }

  start() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'bubbles-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    if (this.text) {
      this.textOverlay = document.createElement('div');
      this.textOverlay.className = 'bubbles-text';
      this.textOverlay.textContent = this.text;
      this.container.appendChild(this.textOverlay);
    }

    const style = document.createElement('style');
    style.textContent = `
      .bubbles-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .bubbles-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(100, 200, 255, 0.8), 0 0 40px rgba(100, 150, 255, 0.5);
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    this.initBubbles();

    if (this.reducedMotion) {
      this.drawBubbles();
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

  initBubbles() {
    this.bubbles = [];
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      this.bubbles.push(this.createBubble());
    }
  }

  createBubble(fromBottom = false) {
    const radius = Math.random() * 40 + 20;
    return {
      x: Math.random() * this.canvas.width,
      y: fromBottom ? this.canvas.height + radius : Math.random() * this.canvas.height,
      radius,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 1 + 0.5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01
    };
  }

  drawBubble(bubble) {
    const { x, y, radius, color } = bubble;

    // Main bubble gradient
    const gradient = this.ctx.createRadialGradient(
      x - radius * 0.3, y - radius * 0.3, 0,
      x, y, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Highlight
    this.ctx.beginPath();
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fill();

    // Edge shine
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  drawBubbles() {
    this.ctx.fillStyle = 'rgba(10, 20, 40, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const bubble of this.bubbles) {
      this.drawBubble(bubble);
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = normalizeDeltaTime(currentTime, this.lastTime);
    this.lastTime = currentTime;

    // Clear with dark blue
    this.ctx.fillStyle = 'rgba(10, 20, 40, 1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];

      // Wobble side to side
      b.wobbleOffset += b.wobbleSpeed * deltaTime * this.speed;
      b.x += (b.vx + Math.sin(b.wobbleOffset) * 0.3) * deltaTime * this.speed;
      b.y += b.vy * deltaTime * this.speed;

      // Reset bubble when it goes off top
      if (b.y + b.radius < 0) {
        this.bubbles[i] = this.createBubble(true);
      }

      // Wrap horizontally
      if (b.x < -b.radius) b.x = this.canvas.width + b.radius;
      if (b.x > this.canvas.width + b.radius) b.x = -b.radius;

      this.drawBubble(b);
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

export { BubblesEffect };
export default BubblesEffect;
