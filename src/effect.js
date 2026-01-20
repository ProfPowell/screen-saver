/**
 * @fileoverview Base Effect class for screen saver effects.
 */

import { prefersReducedMotion } from './utils/reduced-motion.js';

/**
 * Base class for screen saver effects.
 * @abstract
 */
class Effect {
  /**
   * @param {HTMLElement} container - The container element to render into
   * @param {string} text - The text to display
   * @param {number} speed - Animation speed multiplier
   */
  constructor(container, text, speed) {
    this.container = container;
    this.text = text;
    this.speed = speed;
    this.animationId = null;
    this.reducedMotion = prefersReducedMotion();
  }

  /** Start the effect animation */
  start() {
    throw new Error('start() must be implemented by subclass');
  }

  /** Stop the effect animation */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /** Clean up resources */
  destroy() {
    this.stop();
    this.container.innerHTML = '';
  }

  /**
   * Update the text displayed by the effect.
   * @param {string} text
   */
  updateText(text) {
    this.text = text;
  }
}

export { Effect };
export default Effect;
