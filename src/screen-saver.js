/**
 * @fileoverview Screen Saver Web Component
 * A vanilla JavaScript web component that displays retro screen saver effects after idle timeout.
 */

// ============================================================================
// Effect Base Class
// ============================================================================

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
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
}

// ============================================================================
// Bounce3D Effect
// ============================================================================

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
    this.colors = [
      '#ff0000', '#ff7f00', '#ffff00', '#00ff00',
      '#0000ff', '#4b0082', '#9400d3', '#00ffff',
      '#ff00ff', '#00ff7f'
    ];
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
    const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to ~60fps
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

// ============================================================================
// Matrix Effect
// ============================================================================

/**
 * Matrix-style falling character rain effect.
 * Canvas-based with Japanese katakana + ASCII characters.
 */
class MatrixEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.ctx = null;
    this.columns = [];
    this.fontSize = 16;
    this.lastTime = 0;
    this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }

  start() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'matrix-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Create centered text overlay
    const textOverlay = document.createElement('div');
    textOverlay.className = 'matrix-text';
    textOverlay.textContent = this.text;
    this.container.appendChild(textOverlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .matrix-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .matrix-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: #00ff00;
        text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00;
        z-index: 1;
        user-select: none;
      }
    `;
    this.container.appendChild(style);

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));

    if (this.reducedMotion) {
      // Just show static text, no animation
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.lastTime = performance.now();
    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Initialize columns
    const columnCount = Math.ceil(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let i = 0; i < columnCount; i++) {
      this.columns[i] = Math.random() * this.canvas.height / this.fontSize;
    }
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Throttle to ~30fps for authentic retro feel
    if (deltaTime < 33 / this.speed) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastTime = currentTime;

    // Semi-transparent black overlay for trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw characters
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = `${this.fontSize}px monospace`;

    for (let i = 0; i < this.columns.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.columns[i] * this.fontSize;

      // Brighter leading character
      if (Math.random() > 0.9) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = '#00ff00';
      }

      this.ctx.fillText(char, x, y);

      // Reset column randomly or when it goes off screen
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.columns[i] = 0;
      }
      this.columns[i]++;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    window.removeEventListener('resize', this.resize.bind(this));
    super.destroy();
  }
}

// ============================================================================
// ASCII Glitch Effect
// ============================================================================

/**
 * Glitchy ASCII text effect with random character swapping and flicker.
 */
class AsciiGlitchEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.textElement = null;
    this.originalText = text;
    this.glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
    if (deltaTime < 50 / this.speed) {
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
}

// ============================================================================
// Effect Registry
// ============================================================================

const effectRegistry = new Map([
  ['bounce3d', Bounce3DEffect],
  ['matrix', MatrixEffect],
  ['ascii-glitch', AsciiGlitchEffect],
]);

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
    effectRegistry.set(name, effectClass);
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
  }

  connectedCallback() {
    this._render();
    this._startIdleDetection();
  }

  disconnectedCallback() {
    this._stopIdleDetection();
    this.deactivate();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'timeout') {
      this._resetIdleTimer();
    } else if (name === 'effect' && this._isActive) {
      // Switch effect while active
      this._destroyEffect();
      this._createEffect();
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

    this._startIdleDetection();

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
  }

  _getSlotText() {
    const slot = this.shadowRoot.querySelector('slot');
    const nodes = slot.assignedNodes({ flatten: true });
    return nodes.map(node => node.textContent).join('').trim() || 'Screen Saver';
  }

  _createEffect() {
    const container = this.shadowRoot.querySelector('.effect-container');
    const EffectClass = effectRegistry.get(this.effect) || Bounce3DEffect;
    const text = this._getSlotText();

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
}

// Register the custom element
customElements.define('screen-saver', ScreenSaver);

// Export for ES modules
export { ScreenSaver, Effect, Bounce3DEffect, MatrixEffect, AsciiGlitchEffect };
export default ScreenSaver;
