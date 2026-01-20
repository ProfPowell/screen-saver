/**
 * @fileoverview Screen Saver Web Component
 * A vanilla JavaScript web component that displays retro screen saver effects after idle timeout.
 */

import { Effect } from './effect.js';
import { effectRegistry, registerEffect, getEffect } from './registry.js';
import { Bounce3DEffect, MatrixEffect, AsciiGlitchEffect, StarfieldEffect, PlasmaEffect, FireworksEffect, BubblesEffect, PipesEffect, MystifyEffect, TunnelEffect, SlideshowEffect, SnowEffect } from './effects/index.js';

// ============================================================================
// Screen Saver Component
// ============================================================================

/**
 * Screen Saver Web Component
 *
 * @element screen-saver
 * @slot - Text content to display in the screen saver
 *
 * @attr {number} timeout - Idle delay in seconds (default: 180)
 * @attr {string} effect - Effect name: bounce3d, matrix, ascii-glitch (default: bounce3d)
 * @attr {number} speed - Animation speed multiplier (default: 1)
 * @attr {string} background - Background color or image URL
 *
 * @fires screensaver-activate - When the screen saver activates
 * @fires screensaver-deactivate - When the screen saver dismisses, includes duration
 *
 * @example
 * <screen-saver timeout="180" effect="bounce3d">Whoa!</screen-saver>
 */
class ScreenSaver extends HTMLElement {
  static get observedAttributes() {
    return ['timeout', 'effect', 'speed', 'background'];
  }

  /**
   * Register a custom effect.
   * @param {string} name - Effect name
   * @param {typeof Effect} effectClass - Effect class extending Effect
   */
  static registerEffect(name, effectClass) {
    registerEffect(name, effectClass);
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._isActive = false;
    this._idleTimer = null;
    this._activatedAt = null;
    this._effect = null;
    this._boundResetTimer = this._resetIdleTimer.bind(this);
    this._boundDismiss = this._handleDismiss.bind(this);
    this._boundSlotChange = this._handleSlotChange.bind(this);
    this._slotElement = null;
  }

  connectedCallback() {
    this._render();
    this._startIdleDetection();
  }

  disconnectedCallback() {
    this._stopIdleDetection();
    this.deactivate();
    if (this._slotElement) {
      this._slotElement.removeEventListener('slotchange', this._boundSlotChange);
      this._slotElement = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'timeout') {
      this._resetIdleTimer();
    } else if (name === 'effect' && this._isActive) {
      // Switch effect while active
      this._destroyEffect();
      this._createEffect();
    } else if (name === 'speed' && this._isActive && this._effect) {
      this._effect.speed = this.speed;
    } else if (name === 'background' && this._isActive) {
      this._updateBackground();
    }
  }

  /** @returns {boolean} Whether the screen saver is currently active */
  get isActive() {
    return this._isActive;
  }

  /** @returns {number} Timeout in seconds */
  get timeout() {
    return parseInt(this.getAttribute('timeout'), 10) || 180;
  }

  set timeout(value) {
    this.setAttribute('timeout', String(value));
  }

  /** @returns {string} Current effect name */
  get effect() {
    return this.getAttribute('effect') || 'bounce3d';
  }

  set effect(value) {
    this.setAttribute('effect', value);
  }

  /** @returns {number} Animation speed multiplier */
  get speed() {
    return parseFloat(this.getAttribute('speed')) || 1;
  }

  set speed(value) {
    this.setAttribute('speed', String(value));
  }

  /** @returns {string|null} Background setting */
  get background() {
    return this.getAttribute('background');
  }

  set background(value) {
    if (value) {
      this.setAttribute('background', value);
    } else {
      this.removeAttribute('background');
    }
  }

  /** Programmatically activate the screen saver */
  activate() {
    if (this._isActive) return;

    this._isActive = true;
    this._activatedAt = Date.now();
    this._stopIdleDetection();

    const overlay = this.shadowRoot.querySelector('.overlay');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    this._updateBackground();
    this._createEffect();
    this._attachDismissListeners();

    this.dispatchEvent(new CustomEvent('screensaver-activate', {
      bubbles: true,
      composed: true
    }));
  }

  /** Programmatically deactivate the screen saver */
  deactivate() {
    if (!this._isActive) return;

    const duration = this._activatedAt ? Date.now() - this._activatedAt : 0;

    this._isActive = false;
    this._activatedAt = null;

    this._destroyEffect();
    this._detachDismissListeners();

    const overlay = this.shadowRoot.querySelector('.overlay');
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');

    if (this.isConnected) {
      this._startIdleDetection();
    }

    this.dispatchEvent(new CustomEvent('screensaver-deactivate', {
      bubbles: true,
      composed: true,
      detail: { duration }
    }));
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: contents;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--screen-saver-bg, rgba(0, 0, 0, 0.95));
          z-index: var(--screen-saver-z-index, 999999);
          display: none;
          overflow: hidden;
        }

        .overlay.active {
          display: block;
        }

        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .slot-container {
          display: none;
        }
      </style>
      <div class="slot-container"><slot></slot></div>
      <div class="overlay" role="dialog" aria-label="Screen saver" aria-hidden="true">
        <div class="effect-container"></div>
      </div>
    `;
    this._slotElement = this.shadowRoot.querySelector('slot');
    this._slotElement.addEventListener('slotchange', this._boundSlotChange);
  }

  _getSlotText() {
    const slot = this.shadowRoot.querySelector('slot');
    const nodes = slot.assignedNodes({ flatten: true });
    return nodes.map(node => node.textContent).join('').trim();
  }

  /**
   * Get the text to display based on effect requirements.
   * @param {typeof Effect} EffectClass - The effect class
   * @returns {string|null} Text to display, or null if not needed
   */
  _getTextForEffect(EffectClass) {
    const slotText = this._getSlotText();

    // If slot has text, always use it
    if (slotText) {
      return slotText;
    }

    // Check if effect requires text
    if (EffectClass.requiresText) {
      // Default to the site's domain name
      return window.location.hostname || 'Screen Saver';
    }

    // Effect doesn't require text
    return null;
  }

  _createEffect() {
    const container = this.shadowRoot.querySelector('.effect-container');
    const EffectClass = getEffect(this.effect);
    const text = this._getTextForEffect(EffectClass);

    this._effect = new EffectClass(container, text, this.speed);
    this._effect.start();
  }

  _destroyEffect() {
    if (this._effect) {
      this._effect.destroy();
      this._effect = null;
    }
  }

  _updateBackground() {
    const overlay = this.shadowRoot.querySelector('.overlay');
    const bg = this.background;

    if (bg) {
      if (bg.startsWith('http') || bg.startsWith('/') || bg.startsWith('data:')) {
        overlay.style.backgroundImage = `url(${bg})`;
        overlay.style.backgroundSize = 'cover';
        overlay.style.backgroundPosition = 'center';
      } else {
        overlay.style.background = bg;
      }
    } else {
      overlay.style.backgroundImage = '';
      overlay.style.backgroundSize = '';
      overlay.style.backgroundPosition = '';
      overlay.style.background = '';
    }
  }

  _startIdleDetection() {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach(event => {
      document.addEventListener(event, this._boundResetTimer, { passive: true });
    });
    this._resetIdleTimer();
  }

  _stopIdleDetection() {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach(event => {
      document.removeEventListener(event, this._boundResetTimer);
    });
    clearTimeout(this._idleTimer);
  }

  _resetIdleTimer() {
    clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => {
      this.activate();
    }, this.timeout * 1000);
  }

  _attachDismissListeners() {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, this._boundDismiss, { once: true, capture: true });
    });
  }

  _detachDismissListeners() {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.removeEventListener(event, this._boundDismiss, { capture: true });
    });
  }

  _handleDismiss(event) {
    // Grace period of 500ms after activation to prevent immediate dismissal
    // from the same mouse movement that triggered activation
    const timeSinceActivation = Date.now() - this._activatedAt;
    if (timeSinceActivation < 500) {
      // Re-attach listeners since we're ignoring this event
      this._attachDismissListeners();
      return;
    }

    if (this._isActive) {
      this.deactivate();
    }
  }

  _handleSlotChange() {
    if (!this._isActive || !this._effect) return;
    const EffectClass = getEffect(this.effect);
    const text = this._getTextForEffect(EffectClass);
    if (typeof this._effect.updateText === 'function') {
      this._effect.updateText(text);
    }
  }
}

// Register the custom element
customElements.define('screen-saver', ScreenSaver);

// Export for ES modules
export { ScreenSaver, Effect, Bounce3DEffect, MatrixEffect, AsciiGlitchEffect, StarfieldEffect, PlasmaEffect, FireworksEffect, BubblesEffect, PipesEffect, MystifyEffect, TunnelEffect, SlideshowEffect, SnowEffect };
export default ScreenSaver;
