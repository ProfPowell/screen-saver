/**
 * @fileoverview Starfield effect - Classic flying through space stars.
 */

import { Effect } from '../effect.js';

/** Number of stars in the field */
const STAR_COUNT = 200;

/**
 * Classic starfield/warp speed effect.
 * Canvas-based with 3D projected stars flying toward the viewer.
 */
class StarfieldEffect extends Effect {
  static requiresText = false;

  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.stars = [];
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
    this.centerX = 0;
    this.centerY = 0;
  }

  start() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'starfield-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Create centered text overlay (only if text is provided)
    if (this.text) {
      this.textOverlay = document.createElement('div');
      this.textOverlay.className = 'starfield-text';
      this.textOverlay.textContent = this.text;
      this.container.appendChild(this.textOverlay);
    }

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .starfield-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .starfield-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(100, 150, 255, 0.6);
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    // Initialize stars
    this.initStars();

    if (this.reducedMotion) {
      // Draw static starfield
      this.drawStars();
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar() {
    return {
      x: (Math.random() - 0.5) * this.canvas.width * 2,
      y: (Math.random() - 0.5) * this.canvas.height * 2,
      z: Math.random() * 1000 + 1,
      prevZ: 1000
    };
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  drawStars() {
    // Clear with black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const star of this.stars) {
      // Project 3D to 2D
      const scale = 500 / star.z;
      const x = this.centerX + star.x * scale;
      const y = this.centerY + star.y * scale;

      // Skip stars outside viewport
      if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
        continue;
      }

      // Size and brightness based on z-depth
      const size = Math.max(0.5, (1000 - star.z) / 500 * 3);
      const brightness = Math.min(255, Math.floor((1000 - star.z) / 1000 * 255));

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${Math.min(255, brightness + 50)})`;
      this.ctx.fill();
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 16.67;
    this.lastTime = currentTime;

    // Clear with slight trail for motion blur
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const starSpeed = 10 * this.speed * deltaTime;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Store previous position for streak
      star.prevZ = star.z;

      // Move star toward viewer
      star.z -= starSpeed;

      // Reset star if it passes the viewer
      if (star.z <= 1) {
        this.stars[i] = this.createStar();
        this.stars[i].z = 1000;
        continue;
      }

      // Project 3D to 2D
      const scale = 500 / star.z;
      const x = this.centerX + star.x * scale;
      const y = this.centerY + star.y * scale;

      // Previous position for streak
      const prevScale = 500 / star.prevZ;
      const prevX = this.centerX + star.x * prevScale;
      const prevY = this.centerY + star.y * prevScale;

      // Skip stars outside viewport
      if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
        continue;
      }

      // Size and brightness based on z-depth
      const brightness = Math.min(255, Math.floor((1000 - star.z) / 1000 * 255));
      const size = Math.max(0.5, (1000 - star.z) / 500 * 2);

      // Draw streak
      this.ctx.beginPath();
      this.ctx.moveTo(prevX, prevY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${Math.min(255, brightness + 50)}, 0.8)`;
      this.ctx.lineWidth = size;
      this.ctx.stroke();

      // Draw star point
      this.ctx.beginPath();
      this.ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${Math.min(255, brightness + 50)})`;
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

export { StarfieldEffect };
export default StarfieldEffect;
