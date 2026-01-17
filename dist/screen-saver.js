class r {
  /**
   * @param {HTMLElement} container - The container element to render into
   * @param {string} text - The text to display
   * @param {number} speed - Animation speed multiplier
   */
  constructor(t, e, s) {
    this.container = t, this.text = e, this.speed = s, this.animationId = null, this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /** Start the effect animation */
  start() {
    throw new Error("start() must be implemented by subclass");
  }
  /** Stop the effect animation */
  stop() {
    this.animationId && (cancelAnimationFrame(this.animationId), this.animationId = null);
  }
  /** Clean up resources */
  destroy() {
    this.stop(), this.container.innerHTML = "";
  }
}
class c extends r {
  constructor(t, e, s) {
    super(t, e, s), this.x = 0, this.y = 0, this.vx = 2, this.vy = 1.5, this.rotation = 0, this.rotationSpeed = 0.5, this.lastTime = 0, this.colors = [
      "#ff0000",
      "#ff7f00",
      "#ffff00",
      "#00ff00",
      "#0000ff",
      "#4b0082",
      "#9400d3",
      "#00ffff",
      "#ff00ff",
      "#00ff7f"
    ], this.colorIndex = 0, this.textElement = null;
  }
  start() {
    this.textElement = document.createElement("div"), this.textElement.className = "bounce3d-text", this.textElement.textContent = this.text, this.container.appendChild(this.textElement);
    const t = document.createElement("style");
    if (t.textContent = `
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
    `, this.container.appendChild(t), this.reducedMotion) {
      this.textElement.style.left = "50%", this.textElement.style.top = "50%", this.textElement.style.transform = "translate(-50%, -50%)", this.updateExtrusion();
      return;
    }
    const e = this.container.getBoundingClientRect();
    this.x = Math.random() * (e.width - 200), this.y = Math.random() * (e.height - 100), this.lastTime = performance.now(), this.animate();
  }
  updateExtrusion() {
    const t = this.colors[this.colorIndex], e = this.getExtrudeColor(t), s = [];
    for (let i = 1; i <= 8; i++)
      s.push(`${i}px ${i}px 0 ${e}`);
    s.push(`0 0 20px ${t}40`), this.textElement.style.textShadow = s.join(", "), this.textElement.style.color = t;
  }
  getExtrudeColor(t) {
    const e = t.replace("#", ""), s = Math.max(0, parseInt(e.substr(0, 2), 16) - 100), i = Math.max(0, parseInt(e.substr(2, 2), 16) - 100), n = Math.max(0, parseInt(e.substr(4, 2), 16) - 100);
    return `rgb(${s}, ${i}, ${n})`;
  }
  animate() {
    const t = performance.now(), e = (t - this.lastTime) / 16.67;
    this.lastTime = t;
    const s = this.container.getBoundingClientRect(), i = this.textElement.getBoundingClientRect();
    this.x += this.vx * this.speed * e, this.y += this.vy * this.speed * e, this.rotation += this.rotationSpeed * this.speed * e;
    let n = !1;
    (this.x <= 0 || this.x + i.width >= s.width) && (this.vx *= -1, this.x = Math.max(0, Math.min(this.x, s.width - i.width)), n = !0), (this.y <= 0 || this.y + i.height >= s.height) && (this.vy *= -1, this.y = Math.max(0, Math.min(this.y, s.height - i.height)), n = !0), n && (this.colorIndex = (this.colorIndex + 1) % this.colors.length), this.textElement.style.left = `${this.x}px`, this.textElement.style.top = `${this.y}px`, this.textElement.style.transform = `rotateY(${Math.sin(this.rotation * 0.05) * 15}deg)`, this.updateExtrusion(), this.animationId = requestAnimationFrame(() => this.animate());
  }
}
class m extends r {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.columns = [], this.fontSize = 16, this.lastTime = 0, this.chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "matrix-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d");
    const t = document.createElement("div");
    t.className = "matrix-text", t.textContent = this.text, this.container.appendChild(t);
    const e = document.createElement("style");
    if (e.textContent = `
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
    `, this.container.appendChild(e), this.resize(), window.addEventListener("resize", this.resize.bind(this)), this.reducedMotion) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.95)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height;
    const e = Math.ceil(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let s = 0; s < e; s++)
      this.columns[s] = Math.random() * this.canvas.height / this.fontSize;
  }
  animate() {
    const t = performance.now();
    if (t - this.lastTime < 33 / this.speed) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastTime = t, this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.fillStyle = "#00ff00", this.ctx.font = `${this.fontSize}px monospace`;
    for (let s = 0; s < this.columns.length; s++) {
      const i = this.chars[Math.floor(Math.random() * this.chars.length)], n = s * this.fontSize, a = this.columns[s] * this.fontSize;
      Math.random() > 0.9 ? this.ctx.fillStyle = "#ffffff" : this.ctx.fillStyle = "#00ff00", this.ctx.fillText(i, n, a), a > this.canvas.height && Math.random() > 0.975 && (this.columns[s] = 0), this.columns[s]++;
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this.resize.bind(this)), super.destroy();
  }
}
class f extends r {
  constructor(t, e, s) {
    super(t, e, s), this.textElement = null, this.originalText = e, this.glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", this.lastTime = 0, this.glitchIntensity = 0, this.flickerTimeout = null;
  }
  start() {
    const t = document.createElement("div");
    t.className = "glitch-wrapper", this.textElement = document.createElement("div"), this.textElement.className = "glitch-text", this.textElement.textContent = this.text, t.appendChild(this.textElement);
    for (let s = 0; s < 2; s++) {
      const i = document.createElement("div");
      i.className = `glitch-layer glitch-layer-${s + 1}`, i.textContent = this.text, t.appendChild(i);
    }
    this.container.appendChild(t);
    const e = document.createElement("style");
    e.textContent = `
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
    `, this.container.appendChild(e), !this.reducedMotion && (this.lastTime = performance.now(), this.animate());
  }
  animate() {
    const t = performance.now();
    if (t - this.lastTime < 50 / this.speed) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastTime = t, Math.random() > 0.95 ? this.glitchIntensity = Math.random() * 0.5 + 0.3 : this.glitchIntensity *= 0.95;
    let s = "";
    for (let n = 0; n < this.originalText.length; n++)
      Math.random() < this.glitchIntensity ? s += this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)] : s += this.originalText[n];
    this.textElement.textContent = s, this.container.querySelectorAll(".glitch-layer").forEach((n, a) => {
      const l = (Math.random() - 0.5) * this.glitchIntensity * 20, d = (Math.random() - 0.5) * this.glitchIntensity * 5;
      n.style.transform = `translate(${l}px, ${d}px)`, n.textContent = s;
    }), Math.random() > 0.98 && (this.textElement.style.opacity = "0.5", clearTimeout(this.flickerTimeout), this.flickerTimeout = setTimeout(() => {
      this.textElement && (this.textElement.style.opacity = "1");
    }, 50)), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    clearTimeout(this.flickerTimeout), super.destroy();
  }
}
const h = /* @__PURE__ */ new Map([
  ["bounce3d", c],
  ["matrix", m],
  ["ascii-glitch", f]
]);
class u extends HTMLElement {
  static get observedAttributes() {
    return ["timeout", "effect", "speed", "background"];
  }
  /**
   * Register a custom effect.
   * @param {string} name - Effect name
   * @param {typeof Effect} effectClass - Effect class extending Effect
   */
  static registerEffect(t, e) {
    h.set(t, e);
  }
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._isActive = !1, this._idleTimer = null, this._activatedAt = null, this._effect = null, this._boundResetTimer = this._resetIdleTimer.bind(this), this._boundDismiss = this._handleDismiss.bind(this);
  }
  connectedCallback() {
    this._render(), this._startIdleDetection();
  }
  disconnectedCallback() {
    this._stopIdleDetection(), this.deactivate();
  }
  attributeChangedCallback(t, e, s) {
    e !== s && (t === "timeout" ? this._resetIdleTimer() : t === "effect" && this._isActive ? (this._destroyEffect(), this._createEffect()) : t === "background" && this._isActive && this._updateBackground());
  }
  /** @returns {boolean} Whether the screen saver is currently active */
  get isActive() {
    return this._isActive;
  }
  /** @returns {number} Timeout in seconds */
  get timeout() {
    return parseInt(this.getAttribute("timeout"), 10) || 180;
  }
  set timeout(t) {
    this.setAttribute("timeout", String(t));
  }
  /** @returns {string} Current effect name */
  get effect() {
    return this.getAttribute("effect") || "bounce3d";
  }
  set effect(t) {
    this.setAttribute("effect", t);
  }
  /** @returns {number} Animation speed multiplier */
  get speed() {
    return parseFloat(this.getAttribute("speed")) || 1;
  }
  set speed(t) {
    this.setAttribute("speed", String(t));
  }
  /** @returns {string|null} Background setting */
  get background() {
    return this.getAttribute("background");
  }
  set background(t) {
    t ? this.setAttribute("background", t) : this.removeAttribute("background");
  }
  /** Programmatically activate the screen saver */
  activate() {
    if (this._isActive) return;
    this._isActive = !0, this._activatedAt = Date.now(), this._stopIdleDetection();
    const t = this.shadowRoot.querySelector(".overlay");
    t.classList.add("active"), t.setAttribute("aria-hidden", "false"), this._updateBackground(), this._createEffect(), this._attachDismissListeners(), this.dispatchEvent(new CustomEvent("screensaver-activate", {
      bubbles: !0,
      composed: !0
    }));
  }
  /** Programmatically deactivate the screen saver */
  deactivate() {
    if (!this._isActive) return;
    const t = this._activatedAt ? Date.now() - this._activatedAt : 0;
    this._isActive = !1, this._activatedAt = null, this._destroyEffect(), this._detachDismissListeners();
    const e = this.shadowRoot.querySelector(".overlay");
    e.classList.remove("active"), e.setAttribute("aria-hidden", "true"), this._startIdleDetection(), this.dispatchEvent(new CustomEvent("screensaver-deactivate", {
      bubbles: !0,
      composed: !0,
      detail: { duration: t }
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

        ::slotted(*) {
          display: none;
        }
      </style>
      <slot></slot>
      <div class="overlay" role="dialog" aria-label="Screen saver" aria-hidden="true">
        <div class="effect-container"></div>
      </div>
    `;
  }
  _getSlotText() {
    return this.shadowRoot.querySelector("slot").assignedNodes({ flatten: !0 }).map((s) => s.textContent).join("").trim() || "Screen Saver";
  }
  _createEffect() {
    const t = this.shadowRoot.querySelector(".effect-container"), e = h.get(this.effect) || c, s = this._getSlotText();
    this._effect = new e(t, s, this.speed), this._effect.start();
  }
  _destroyEffect() {
    this._effect && (this._effect.destroy(), this._effect = null);
  }
  _updateBackground() {
    const t = this.shadowRoot.querySelector(".overlay"), e = this.background;
    e && (e.startsWith("http") || e.startsWith("/") || e.startsWith("data:") ? (t.style.backgroundImage = `url(${e})`, t.style.backgroundSize = "cover", t.style.backgroundPosition = "center") : t.style.background = e);
  }
  _startIdleDetection() {
    ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"].forEach((e) => {
      document.addEventListener(e, this._boundResetTimer, { passive: !0 });
    }), this._resetIdleTimer();
  }
  _stopIdleDetection() {
    ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"].forEach((e) => {
      document.removeEventListener(e, this._boundResetTimer);
    }), clearTimeout(this._idleTimer);
  }
  _resetIdleTimer() {
    clearTimeout(this._idleTimer), this._idleTimer = setTimeout(() => {
      this.activate();
    }, this.timeout * 1e3);
  }
  _attachDismissListeners() {
    ["mousemove", "mousedown", "keydown", "touchstart"].forEach((e) => {
      document.addEventListener(e, this._boundDismiss, { once: !0, capture: !0 });
    });
  }
  _detachDismissListeners() {
    ["mousemove", "mousedown", "keydown", "touchstart"].forEach((e) => {
      document.removeEventListener(e, this._boundDismiss, { capture: !0 });
    });
  }
  _handleDismiss(t) {
    requestAnimationFrame(() => {
      this._isActive && this.deactivate();
    });
  }
}
customElements.define("screen-saver", u);
export {
  f as AsciiGlitchEffect,
  c as Bounce3DEffect,
  r as Effect,
  m as MatrixEffect,
  u as ScreenSaver,
  u as default
};
//# sourceMappingURL=screen-saver.js.map
