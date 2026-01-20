/**
 * @fileoverview Mystify effect - Bouncing polygon trails.
 */

import { Effect } from '../effect.js';
import { normalizeDeltaTime } from '../utils/timing.js';

/** Colors for polygons */
const COLORS = ['#ff0088', '#00ff88', '#8800ff', '#ff8800'];

/** Number of vertices per polygon */
const VERTEX_COUNT = 4;

/** Trail length (number of previous positions to draw) */
const TRAIL_LENGTH = 20;

/**
 * Mystify effect - Windows classic bouncing connected lines.
 * Canvas-based with colorful polygon trails.
 */
class MystifyEffect extends Effect {
  static requiresText = false;

  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.polygons = [];
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
  }

  start() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'mystify-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    if (this.text) {
      this.textOverlay = document.createElement('div');
      this.textOverlay.className = 'mystify-text';
      this.textOverlay.textContent = this.text;
      this.container.appendChild(this.textOverlay);
    }

    const style = document.createElement('style');
    style.textContent = `
      .mystify-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .mystify-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(255, 100, 255, 0.8), 0 0 40px rgba(100, 255, 100, 0.5);
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    this.initPolygons();

    if (this.reducedMotion) {
      this.drawFrame();
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

  initPolygons() {
    this.polygons = [];

    // Create 2 polygons with different colors
    for (let p = 0; p < 2; p++) {
      const vertices = [];

      for (let i = 0; i < VERTEX_COUNT; i++) {
        vertices.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          history: []
        });
      }

      this.polygons.push({
        vertices,
        color: COLORS[p % COLORS.length]
      });
    }
  }

  drawPolygon(vertices, color, alpha = 1) {
    if (vertices.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      this.ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    // Close the polygon
    this.ctx.lineTo(vertices[0].x, vertices[0].y);

    this.ctx.strokeStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }

  drawFrame() {
    // Clear with black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const polygon of this.polygons) {
      // Draw trail
      const trailLength = polygon.vertices[0].history.length;
      for (let t = 0; t < trailLength; t++) {
        const trailVertices = polygon.vertices.map(v => v.history[t] || { x: v.x, y: v.y });
        const alpha = (t + 1) / (trailLength + 1) * 0.5;
        this.drawPolygon(trailVertices, polygon.color, alpha);
      }

      // Draw current polygon
      this.drawPolygon(polygon.vertices, polygon.color, 1);
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = normalizeDeltaTime(currentTime, this.lastTime);
    this.lastTime = currentTime;

    // Update vertices
    for (const polygon of this.polygons) {
      for (const vertex of polygon.vertices) {
        // Store history
        vertex.history.push({ x: vertex.x, y: vertex.y });
        if (vertex.history.length > TRAIL_LENGTH) {
          vertex.history.shift();
        }

        // Update position
        vertex.x += vertex.vx * deltaTime * this.speed;
        vertex.y += vertex.vy * deltaTime * this.speed;

        // Bounce off edges
        if (vertex.x <= 0 || vertex.x >= this.canvas.width) {
          vertex.vx *= -1;
          vertex.x = Math.max(0, Math.min(this.canvas.width, vertex.x));
        }
        if (vertex.y <= 0 || vertex.y >= this.canvas.height) {
          vertex.vy *= -1;
          vertex.y = Math.max(0, Math.min(this.canvas.height, vertex.y));
        }
      }
    }

    this.drawFrame();

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

export { MystifyEffect };
export default MystifyEffect;
