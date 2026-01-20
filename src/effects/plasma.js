/**
 * @fileoverview Plasma effect - Classic colorful plasma waves.
 */

import { Effect } from '../effect.js';

/**
 * Classic plasma/lava lamp style colorful effect.
 * Canvas-based with sine wave color patterns.
 */
class PlasmaEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.imageData = null;
    this.time = 0;
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
    this.scale = 4; // Render at lower resolution for performance
  }

  start() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'plasma-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Create centered text overlay
    this.textOverlay = document.createElement('div');
    this.textOverlay.className = 'plasma-text';
    this.textOverlay.textContent = this.text;
    this.container.appendChild(this.textOverlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .plasma-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
      }
      .plasma-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.9);
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    if (this.reducedMotion) {
      // Draw static plasma frame
      this.drawPlasma();
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    // Render at lower resolution, CSS scales it up
    this.canvas.width = Math.floor(rect.width / this.scale);
    this.canvas.height = Math.floor(rect.height / this.scale);
    this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
  }

  drawPlasma() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const data = this.imageData.data;
    const t = this.time;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Classic plasma formula using multiple sine waves
        const v1 = Math.sin(x * 0.05 + t);
        const v2 = Math.sin((y * 0.05 + t) * 0.5);
        const v3 = Math.sin((x * 0.05 + y * 0.05 + t) * 0.5);
        const v4 = Math.sin(Math.sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2) * 0.05 + t);

        const v = (v1 + v2 + v3 + v4) / 4;

        // Convert to RGB using different phase shifts for each channel
        const r = Math.floor(Math.sin(v * Math.PI * 2) * 127 + 128);
        const g = Math.floor(Math.sin(v * Math.PI * 2 + 2.094) * 127 + 128); // +2π/3
        const b = Math.floor(Math.sin(v * Math.PI * 2 + 4.188) * 127 + 128); // +4π/3

        const idx = (y * width + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 16.67;
    this.lastTime = currentTime;

    // Update time for animation
    this.time += 0.03 * this.speed * deltaTime;

    this.drawPlasma();

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

export { PlasmaEffect };
export default PlasmaEffect;
