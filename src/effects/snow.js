/**
 * @fileoverview Snow effect - Peaceful falling snow scene
 *
 * This effect demonstrates:
 * - Scene composition with layers
 * - Configurable background image
 * - Parallax depth with multiple snow layers
 * - Wind simulation
 *
 * Usage:
 * <screen-saver effect="snow"
 *   data-background="winter-scene.jpg"
 *   data-snowflakes="200"
 *   data-wind="0.5">
 * </screen-saver>
 */

import { Effect } from '../effect.js';

/** Default winter gradient background */
const DEFAULT_BACKGROUND = 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

/**
 * Snow scene effect with parallax layers and optional background.
 */
class SnowEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.snowflakes = [];
    this.snowflakeCount = 200;
    this.wind = 0;
    this.windTarget = 0;
    this.backgroundUrl = null;
    this.lastTime = 0;
    this.textOverlay = null;
    this._boundResize = this.resize.bind(this);
  }

  start() {
    this.parseConfig();

    // Create background layer
    this.backgroundLayer = document.createElement('div');
    this.backgroundLayer.className = 'snow-background';
    this.container.appendChild(this.backgroundLayer);

    // Create canvas for snow
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'snow-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Create ground layer (optional snow accumulation)
    this.groundLayer = document.createElement('div');
    this.groundLayer.className = 'snow-ground';
    this.container.appendChild(this.groundLayer);

    // Create text overlay
    this.textOverlay = document.createElement('div');
    this.textOverlay.className = 'snow-text';
    this.textOverlay.textContent = this.text;
    this.container.appendChild(this.textOverlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .snow-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${this.backgroundUrl ? `url(${this.backgroundUrl})` : DEFAULT_BACKGROUND};
        background-size: cover;
        background-position: center;
      }
      .snow-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .snow-ground {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40px;
        background: linear-gradient(to top, rgba(255,255,255,0.3) 0%, transparent 100%);
        pointer-events: none;
      }
      .snow-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Georgia', serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 2px 10px rgba(0,0,0,0.5), 0 0 40px rgba(200,220,255,0.5);
        z-index: 2;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this._boundResize);

    this.initSnowflakes();

    if (this.reducedMotion) {
      this.drawSnowflakes();
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  parseConfig() {
    const screenSaver = this.container.closest('screen-saver') ||
                        this.container.getRootNode()?.host;

    if (screenSaver) {
      this.backgroundUrl = screenSaver.getAttribute('data-background');

      const count = screenSaver.getAttribute('data-snowflakes');
      if (count) this.snowflakeCount = parseInt(count, 10);

      const wind = screenSaver.getAttribute('data-wind');
      if (wind) this.windTarget = parseFloat(wind);
    }
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  initSnowflakes() {
    this.snowflakes = [];

    for (let i = 0; i < this.snowflakeCount; i++) {
      this.snowflakes.push(this.createSnowflake());
    }
  }

  createSnowflake(atTop = false) {
    const rect = this.canvas;
    // Depth layer (0-2): affects size, speed, and opacity
    const depth = Math.random() * 3;

    return {
      x: Math.random() * rect.width,
      y: atTop ? -10 : Math.random() * rect.height,
      radius: 1 + depth * 1.5,
      depth: depth,
      speed: 0.5 + depth * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      opacity: 0.3 + depth * 0.25
    };
  }

  drawSnowflakes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const flake of this.snowflakes) {
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      this.ctx.fill();

      // Add slight glow to larger flakes
      if (flake.radius > 2) {
        this.ctx.beginPath();
        this.ctx.arc(flake.x, flake.y, flake.radius * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(200, 220, 255, ${flake.opacity * 0.2})`;
        this.ctx.fill();
      }
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 16.67;
    this.lastTime = currentTime;

    // Smoothly adjust wind
    this.wind += (this.windTarget - this.wind) * 0.01;

    // Randomly change wind target occasionally
    if (Math.random() < 0.002) {
      this.windTarget = (Math.random() - 0.5) * 2;
    }

    // Update snowflakes
    for (let i = 0; i < this.snowflakes.length; i++) {
      const flake = this.snowflakes[i];

      // Wobble side to side
      flake.wobble += flake.wobbleSpeed * deltaTime * this.speed;
      const wobbleX = Math.sin(flake.wobble) * (1 + flake.depth * 0.5);

      // Apply movement - deeper flakes (closer) move faster
      flake.x += (wobbleX + this.wind * (1 + flake.depth * 0.5)) * deltaTime * this.speed;
      flake.y += flake.speed * deltaTime * this.speed;

      // Wrap around edges
      if (flake.y > this.canvas.height + 10) {
        this.snowflakes[i] = this.createSnowflake(true);
      }
      if (flake.x < -10) {
        flake.x = this.canvas.width + 10;
      } else if (flake.x > this.canvas.width + 10) {
        flake.x = -10;
      }
    }

    this.drawSnowflakes();
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

export { SnowEffect };
export default SnowEffect;
