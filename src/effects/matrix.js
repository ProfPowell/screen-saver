/**
 * @fileoverview Matrix effect - Falling character rain.
 */

import { Effect } from '../effect.js';
import { shouldSkipFrame } from '../utils/timing.js';

/** Character set for matrix rain (katakana + ASCII) */
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Matrix-style falling character rain effect.
 * Canvas-based with Japanese katakana + ASCII characters.
 */
class MatrixEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.columns = [];
    this.fontSize = 16;
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
    this.chars = MATRIX_CHARS;
  }

  start() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'matrix-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Create centered text overlay
    this.textOverlay = document.createElement('div');
    this.textOverlay.className = 'matrix-text';
    this.textOverlay.textContent = this.text;
    this.container.appendChild(this.textOverlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .matrix-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .matrix-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: #00ff00;
        text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00;
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    if (this.reducedMotion) {
      // Just show static text, no animation
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
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

    // Initialize columns
    const columnCount = Math.ceil(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let i = 0; i < columnCount; i++) {
      this.columns[i] = Math.random() * this.canvas.height / this.fontSize;
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Throttle to ~30fps for authentic retro feel
    if (shouldSkipFrame(deltaTime, 30 * this.speed)) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastTime = currentTime;

    // Semi-transparent black overlay for trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw characters
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.columns.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.columns[i] * this.fontSize;

      // Brighter leading character
      if (Math.random() > 0.9) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = '#00ff00';
      }

      this.ctx.fillText(char, x, y);

      // Reset column randomly or when it goes off screen
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.columns[i] = 0;
      }
      this.columns[i]++;
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

export { MatrixEffect };
export default MatrixEffect;
