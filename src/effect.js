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
   * Whether this effect requires text to be displayed.
   * If true and no text is provided, defaults to the site's domain name.
   * If false, the effect runs without text overlay.
   * @type {boolean}
   */
  static requiresText = true;

  /**
   * @param {HTMLElement} container - The container element to render into
   * @param {string|null} text - The text to display (null if not required)
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
