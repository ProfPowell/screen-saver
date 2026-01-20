/**
 * @fileoverview Bounce3D effect - Classic bouncing 3D extruded text.
 */

import { Effect } from '../effect.js';
import { normalizeDeltaTime } from '../utils/timing.js';

/** Color palette for bouncing text */
const COLORS = [
  '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
  '#0000ff', '#4b0082', '#9400d3', '#00ffff',
  '#ff00ff', '#00ff7f'
];

/**
 * Classic bouncing 3D extruded text effect.
 * Features extruded shadow via layered text-shadow and subtle Y-axis rotation.
 */
class Bounce3DEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.x = 0;
    this.y = 0;
    this.vx = 2;
    this.vy = 1.5;
    this.rotation = 0;
    this.rotationSpeed = 0.5;
    this.lastTime = 0;
    this.colors = COLORS;
    this.colorIndex = 0;
    this.textElement = null;
  }

  start() {
    // Create the text element
    this.textElement = document.createElement('div');
    this.textElement.className = 'bounce3d-text';
    this.textElement.textContent = this.text;
    this.container.appendChild(this.textElement);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .bounce3d-text {
        position: absolute;
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #00ff00);
        white-space: nowrap;
        transform-style: preserve-3d;
        perspective: 1000px;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    if (this.reducedMotion) {
      // Static centered display for reduced motion
      this.textElement.style.left = '50%';
      this.textElement.style.top = '50%';
      this.textElement.style.transform = 'translate(-50%, -50%)';
      this.updateExtrusion();
      return;
    }

    // Wait for next frame to ensure container is laid out
    requestAnimationFrame(() => {
      const rect = this.container.getBoundingClientRect();
      // Initialize position with fallback for zero dimensions
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      this.x = Math.random() * Math.max(0, width - 300);
      this.y = Math.random() * Math.max(0, height - 100);

      this.lastTime = performance.now();
      this.animate();
    });
  }

  updateExtrusion() {
    const color = this.colors[this.colorIndex];
    const extrudeColor = this.getExtrudeColor(color);

    // Create layered text-shadow for 3D extrusion effect
    const shadows = [];
    for (let i = 1; i <= 8; i++) {
      shadows.push(`${i}px ${i}px 0 ${extrudeColor}`);
    }
    // Add a subtle glow
    shadows.push(`0 0 20px ${color}40`);

    this.textElement.style.textShadow = shadows.join(', ');
    this.textElement.style.color = color;
  }

  updateText(text) {
    super.updateText(text);
    if (this.textElement) {
      this.textElement.textContent = text;
    }
  }

  getExtrudeColor(color) {
    // Darken the color for extrusion
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 100);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 100);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 100);
    return `rgb(${r}, ${g}, ${b})`;
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = normalizeDeltaTime(currentTime, this.lastTime);
    this.lastTime = currentTime;

    const rect = this.container.getBoundingClientRect();
    const textRect = this.textElement.getBoundingClientRect();

    // Use fallback dimensions if container not properly laid out
    const containerWidth = rect.width || window.innerWidth;
    const containerHeight = rect.height || window.innerHeight;
    const textWidth = textRect.width || 200;
    const textHeight = textRect.height || 80;

    // Update position
    this.x += this.vx * this.speed * deltaTime;
    this.y += this.vy * this.speed * deltaTime;

    // Update rotation
    this.rotation += this.rotationSpeed * this.speed * deltaTime;

    // Bounce off edges
    let bounced = false;
    if (this.x <= 0 || this.x + textWidth >= containerWidth) {
      this.vx *= -1;
      this.x = Math.max(0, Math.min(this.x, containerWidth - textWidth));
      bounced = true;
    }
    if (this.y <= 0 || this.y + textHeight >= containerHeight) {
      this.vy *= -1;
      this.y = Math.max(0, Math.min(this.y, containerHeight - textHeight));
      bounced = true;
    }

    // Change color on bounce
    if (bounced) {
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }

    // Apply transforms
    this.textElement.style.left = `${this.x}px`;
    this.textElement.style.top = `${this.y}px`;
    this.textElement.style.transform = `rotateY(${Math.sin(this.rotation * 0.05) * 15}deg)`;

    this.updateExtrusion();

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

export { Bounce3DEffect };
export default Bounce3DEffect;
