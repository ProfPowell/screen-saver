/**
 * @fileoverview ASCII Glitch effect - Glitchy text with random character swapping.
 */

import { Effect } from '../effect.js';
import { shouldSkipFrame } from '../utils/timing.js';

/** Character set for glitch effects */
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Glitchy ASCII text effect with random character swapping and flicker.
 */
class AsciiGlitchEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.textElement = null;
    this.originalText = text;
    this.glitchChars = GLITCH_CHARS;
    this.lastTime = 0;
    this.glitchIntensity = 0;
    this.flickerTimeout = null;
  }

  start() {
    // Create container for the effect
    const wrapper = document.createElement('div');
    wrapper.className = 'glitch-wrapper';

    this.textElement = document.createElement('div');
    this.textElement.className = 'glitch-text';
    this.textElement.textContent = this.text;
    wrapper.appendChild(this.textElement);

    // Create glitch layers
    for (let i = 0; i < 2; i++) {
      const layer = document.createElement('div');
      layer.className = `glitch-layer glitch-layer-${i + 1}`;
      layer.textContent = this.text;
      wrapper.appendChild(layer);
    }

    this.container.appendChild(wrapper);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .glitch-wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .glitch-text, .glitch-layer {
        font-family: var(--screen-saver-font-family, 'Courier New', monospace);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #00ff00);
        white-space: nowrap;
        user-select: none;
      }
      .glitch-layer {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.8;
      }
      .glitch-layer-1 {
        color: #ff0000;
        clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
      }
      .glitch-layer-2 {
        color: #0000ff;
        clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
      }
    `;
    this.container.appendChild(style);

    if (this.reducedMotion) {
      // Static display for reduced motion
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Update at ~20fps for glitchy feel
    if (shouldSkipFrame(deltaTime, 20 * this.speed)) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastTime = currentTime;

    // Random glitch intensity spikes
    if (Math.random() > 0.95) {
      this.glitchIntensity = Math.random() * 0.5 + 0.3;
    } else {
      this.glitchIntensity *= 0.95;
    }

    // Apply glitch to text
    let glitchedText = '';
    for (let i = 0; i < this.originalText.length; i++) {
      if (Math.random() < this.glitchIntensity) {
        glitchedText += this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];
      } else {
        glitchedText += this.originalText[i];
      }
    }

    this.textElement.textContent = glitchedText;

    // Update layers with offset
    const layers = this.container.querySelectorAll('.glitch-layer');
    layers.forEach((layer, index) => {
      const offsetX = (Math.random() - 0.5) * this.glitchIntensity * 20;
      const offsetY = (Math.random() - 0.5) * this.glitchIntensity * 5;
      layer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      layer.textContent = glitchedText;
    });

    // Random flicker effect
    if (Math.random() > 0.98) {
      this.textElement.style.opacity = '0.5';
      clearTimeout(this.flickerTimeout);
      this.flickerTimeout = setTimeout(() => {
        if (this.textElement) {
          this.textElement.style.opacity = '1';
        }
      }, 50);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    clearTimeout(this.flickerTimeout);
    super.destroy();
  }

  updateText(text) {
    super.updateText(text);
    this.originalText = text;
    if (this.textElement) {
      this.textElement.textContent = text;
    }
    const layers = this.container.querySelectorAll('.glitch-layer');
    layers.forEach(layer => {
      layer.textContent = text;
    });
  }
}

export { AsciiGlitchEffect };
export default AsciiGlitchEffect;
