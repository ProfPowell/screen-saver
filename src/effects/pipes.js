/**
 * @fileoverview Pipes effect - Classic 3D pipes screensaver.
 */

import { Effect } from '../effect.js';
import { normalizeDeltaTime } from '../utils/timing.js';

/** Pipe colors */
const COLORS = [
  '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ff8800', '#88ff00'
];

/** Directions: 0=right, 1=down, 2=left, 3=up, 4=forward, 5=back */
const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 }
];

/**
 * Classic 3D pipes effect.
 * Canvas-based recreation of the Windows screensaver.
 */
class PipesEffect extends Effect {
  static requiresText = false;

  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.pipes = [];
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
    this.gridSize = 30;
    this.pipeWidth = 12;
    this.resetTimer = 0;
  }

  start() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pipes-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    if (this.text) {
      this.textOverlay = document.createElement('div');
      this.textOverlay.className = 'pipes-text';
      this.textOverlay.textContent = this.text;
      this.container.appendChild(this.textOverlay);
    }

    const style = document.createElement('style');
    style.textContent = `
      .pipes-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .pipes-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(100, 255, 100, 0.8), 0 0 40px rgba(50, 200, 50, 0.5);
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    this.initPipes();

    if (this.reducedMotion) {
      // Draw some static pipes
      for (let i = 0; i < 200; i++) {
        this.updatePipes(1);
      }
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  initPipes() {
    this.pipes = [];
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.addPipe();
  }

  addPipe() {
    const gridCols = Math.floor(this.canvas.width / this.gridSize);
    const gridRows = Math.floor(this.canvas.height / this.gridSize);

    this.pipes.push({
      x: Math.floor(Math.random() * gridCols) * this.gridSize + this.gridSize / 2,
      y: Math.floor(Math.random() * gridRows) * this.gridSize + this.gridSize / 2,
      dir: Math.floor(Math.random() * 4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      segments: 0,
      maxSegments: 50 + Math.floor(Math.random() * 100)
    });
  }

  drawJoint(x, y, color) {
    // Draw a spherical joint
    const gradient = this.ctx.createRadialGradient(
      x - 3, y - 3, 0,
      x, y, this.pipeWidth
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, this.darkenColor(color, 0.5));

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.pipeWidth, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  drawPipeSegment(x1, y1, x2, y2, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const isHorizontal = dx !== 0;

    // Create gradient for 3D effect
    const gradient = isHorizontal
      ? this.ctx.createLinearGradient(x1, y1 - this.pipeWidth, x1, y1 + this.pipeWidth)
      : this.ctx.createLinearGradient(x1 - this.pipeWidth, y1, x1 + this.pipeWidth, y1);

    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, this.darkenColor(color, 0.4));

    this.ctx.beginPath();
    if (isHorizontal) {
      this.ctx.rect(
        Math.min(x1, x2) - 2,
        y1 - this.pipeWidth / 2,
        Math.abs(dx) + 4,
        this.pipeWidth
      );
    } else {
      this.ctx.rect(
        x1 - this.pipeWidth / 2,
        Math.min(y1, y2) - 2,
        this.pipeWidth,
        Math.abs(dy) + 4
      );
    }
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  updatePipes(deltaTime) {
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      const dir = DIRECTIONS[pipe.dir];
      const newX = pipe.x + dir.dx * this.gridSize;
      const newY = pipe.y + dir.dy * this.gridSize;

      // Draw segment
      this.drawPipeSegment(pipe.x, pipe.y, newX, newY, pipe.color);
      this.drawJoint(newX, newY, pipe.color);

      pipe.x = newX;
      pipe.y = newY;
      pipe.segments++;

      // Check if pipe should turn or end
      if (pipe.segments >= pipe.maxSegments ||
          newX < 0 || newX > this.canvas.width ||
          newY < 0 || newY > this.canvas.height) {
        this.pipes.splice(i, 1);
        this.addPipe();
        continue;
      }

      // Random turn
      if (Math.random() < 0.3) {
        // Turn 90 degrees
        const turn = Math.random() < 0.5 ? 1 : -1;
        pipe.dir = (pipe.dir + turn + 4) % 4;
      }
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = normalizeDeltaTime(currentTime, this.lastTime);
    this.lastTime = currentTime;

    // Add more pipes occasionally
    if (this.pipes.length < 3 && Math.random() < 0.02) {
      this.addPipe();
    }

    this.updatePipes(deltaTime);

    // Periodically reset the canvas
    this.resetTimer += deltaTime * this.speed;
    if (this.resetTimer > 500) {
      this.initPipes();
      this.resetTimer = 0;
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

export { PipesEffect };
export default PipesEffect;
