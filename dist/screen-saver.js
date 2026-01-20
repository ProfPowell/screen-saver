function M() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
class c {
  /**
   * @param {HTMLElement} container - The container element to render into
   * @param {string} text - The text to display
   * @param {number} speed - Animation speed multiplier
   */
  constructor(t, e, s) {
    this.container = t, this.text = e, this.speed = s, this.animationId = null, this.reducedMotion = M();
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
  /**
   * Update the text displayed by the effect.
   * @param {string} text
   */
  updateText(t) {
    this.text = t;
  }
}
function u(h, t) {
  return (h - t) / 16.67;
}
function C(h, t) {
  const e = 1e3 / t;
  return h < e;
}
const z = [
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
];
class E extends c {
  constructor(t, e, s) {
    super(t, e, s), this.x = 0, this.y = 0, this.vx = 2, this.vy = 1.5, this.rotation = 0, this.rotationSpeed = 0.5, this.lastTime = 0, this.colors = z, this.colorIndex = 0, this.textElement = null;
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
    requestAnimationFrame(() => {
      const e = this.container.getBoundingClientRect(), s = e.width || window.innerWidth, i = e.height || window.innerHeight;
      this.x = Math.random() * Math.max(0, s - 300), this.y = Math.random() * Math.max(0, i - 100), this.lastTime = performance.now(), this.animate();
    });
  }
  updateExtrusion() {
    const t = this.colors[this.colorIndex], e = this.getExtrudeColor(t), s = [];
    for (let i = 1; i <= 8; i++)
      s.push(`${i}px ${i}px 0 ${e}`);
    s.push(`0 0 20px ${t}40`), this.textElement.style.textShadow = s.join(", "), this.textElement.style.color = t;
  }
  updateText(t) {
    super.updateText(t), this.textElement && (this.textElement.textContent = t);
  }
  getExtrudeColor(t) {
    const e = t.replace("#", ""), s = Math.max(0, parseInt(e.substr(0, 2), 16) - 100), i = Math.max(0, parseInt(e.substr(2, 2), 16) - 100), n = Math.max(0, parseInt(e.substr(4, 2), 16) - 100);
    return `rgb(${s}, ${i}, ${n})`;
  }
  animate() {
    const t = performance.now(), e = u(t, this.lastTime);
    this.lastTime = t;
    const s = this.container.getBoundingClientRect(), i = this.textElement.getBoundingClientRect(), n = s.width || window.innerWidth, a = s.height || window.innerHeight, r = i.width || 200, o = i.height || 80;
    this.x += this.vx * this.speed * e, this.y += this.vy * this.speed * e, this.rotation += this.rotationSpeed * this.speed * e;
    let l = !1;
    (this.x <= 0 || this.x + r >= n) && (this.vx *= -1, this.x = Math.max(0, Math.min(this.x, n - r)), l = !0), (this.y <= 0 || this.y + o >= a) && (this.vy *= -1, this.y = Math.max(0, Math.min(this.y, a - o)), l = !0), l && (this.colorIndex = (this.colorIndex + 1) % this.colors.length), this.textElement.style.left = `${this.x}px`, this.textElement.style.top = `${this.y}px`, this.textElement.style.transform = `rotateY(${Math.sin(this.rotation * 0.05) * 15}deg)`, this.updateExtrusion(), this.animationId = requestAnimationFrame(() => this.animate());
  }
}
const _ = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
class k extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.columns = [], this.fontSize = 16, this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this), this.chars = _;
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "matrix-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "matrix-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
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
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.reducedMotion) {
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
    const t = performance.now(), e = t - this.lastTime;
    if (C(e, 30 * this.speed)) {
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
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const I = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
class R extends c {
  constructor(t, e, s) {
    super(t, e, s), this.textElement = null, this.originalText = e, this.glitchChars = I, this.lastTime = 0, this.glitchIntensity = 0, this.flickerTimeout = null;
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
    const t = performance.now(), e = t - this.lastTime;
    if (C(e, 20 * this.speed)) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastTime = t, Math.random() > 0.95 ? this.glitchIntensity = Math.random() * 0.5 + 0.3 : this.glitchIntensity *= 0.95;
    let s = "";
    for (let n = 0; n < this.originalText.length; n++)
      Math.random() < this.glitchIntensity ? s += this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)] : s += this.originalText[n];
    this.textElement.textContent = s, this.container.querySelectorAll(".glitch-layer").forEach((n, a) => {
      const r = (Math.random() - 0.5) * this.glitchIntensity * 20, o = (Math.random() - 0.5) * this.glitchIntensity * 5;
      n.style.transform = `translate(${r}px, ${o}px)`, n.textContent = s;
    }), Math.random() > 0.98 && (this.textElement.style.opacity = "0.5", clearTimeout(this.flickerTimeout), this.flickerTimeout = setTimeout(() => {
      this.textElement && (this.textElement.style.opacity = "1");
    }, 50)), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    clearTimeout(this.flickerTimeout), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.originalText = t, this.textElement && (this.textElement.textContent = t), this.container.querySelectorAll(".glitch-layer").forEach((s) => {
      s.textContent = t;
    });
  }
}
const O = 200;
class A extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.stars = [], this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this), this.centerX = 0, this.centerY = 0;
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "starfield-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "starfield-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
      .starfield-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .starfield-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(100, 150, 255, 0.6);
        z-index: 1;
        user-select: none;
      }
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.initStars(), this.reducedMotion) {
      this.drawStars();
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  initStars() {
    this.stars = [];
    for (let t = 0; t < O; t++)
      this.stars.push(this.createStar());
  }
  createStar() {
    return {
      x: (Math.random() - 0.5) * this.canvas.width * 2,
      y: (Math.random() - 0.5) * this.canvas.height * 2,
      z: Math.random() * 1e3 + 1,
      prevZ: 1e3
    };
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height, this.centerX = this.canvas.width / 2, this.centerY = this.canvas.height / 2;
  }
  drawStars() {
    this.ctx.fillStyle = "#000000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const t of this.stars) {
      const e = 500 / t.z, s = this.centerX + t.x * e, i = this.centerY + t.y * e;
      if (s < 0 || s > this.canvas.width || i < 0 || i > this.canvas.height)
        continue;
      const n = Math.max(0.5, (1e3 - t.z) / 500 * 3), a = Math.min(255, Math.floor((1e3 - t.z) / 1e3 * 255));
      this.ctx.beginPath(), this.ctx.arc(s, i, n, 0, Math.PI * 2), this.ctx.fillStyle = `rgb(${a}, ${a}, ${Math.min(255, a + 50)})`, this.ctx.fill();
    }
  }
  animate() {
    const t = performance.now(), e = (t - this.lastTime) / 16.67;
    this.lastTime = t, this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const s = 10 * this.speed * e;
    for (let i = 0; i < this.stars.length; i++) {
      const n = this.stars[i];
      if (n.prevZ = n.z, n.z -= s, n.z <= 1) {
        this.stars[i] = this.createStar(), this.stars[i].z = 1e3;
        continue;
      }
      const a = 500 / n.z, r = this.centerX + n.x * a, o = this.centerY + n.y * a, l = 500 / n.prevZ, f = this.centerX + n.x * l, d = this.centerY + n.y * l;
      if (r < 0 || r > this.canvas.width || o < 0 || o > this.canvas.height)
        continue;
      const m = Math.min(255, Math.floor((1e3 - n.z) / 1e3 * 255)), p = Math.max(0.5, (1e3 - n.z) / 500 * 2);
      this.ctx.beginPath(), this.ctx.moveTo(f, d), this.ctx.lineTo(r, o), this.ctx.strokeStyle = `rgba(${m}, ${m}, ${Math.min(255, m + 50)}, 0.8)`, this.ctx.lineWidth = p, this.ctx.stroke(), this.ctx.beginPath(), this.ctx.arc(r, o, p * 1.5, 0, Math.PI * 2), this.ctx.fillStyle = `rgb(${m}, ${m}, ${Math.min(255, m + 50)})`, this.ctx.fill();
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
class P extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.imageData = null, this.time = 0, this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this), this.scale = 4;
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "plasma-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "plasma-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
      .plasma-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
      }
      .plasma-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.9);
        z-index: 1;
        user-select: none;
      }
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.reducedMotion) {
      this.drawPlasma();
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = Math.floor(t.width / this.scale), this.canvas.height = Math.floor(t.height / this.scale), this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
  }
  drawPlasma() {
    const t = this.canvas.width, e = this.canvas.height, s = this.imageData.data, i = this.time;
    for (let n = 0; n < e; n++)
      for (let a = 0; a < t; a++) {
        const r = Math.sin(a * 0.05 + i), o = Math.sin((n * 0.05 + i) * 0.5), l = Math.sin((a * 0.05 + n * 0.05 + i) * 0.5), f = Math.sin(Math.sqrt((a - t / 2) ** 2 + (n - e / 2) ** 2) * 0.05 + i), d = (r + o + l + f) / 4, m = Math.floor(Math.sin(d * Math.PI * 2) * 127 + 128), p = Math.floor(Math.sin(d * Math.PI * 2 + 2.094) * 127 + 128), S = Math.floor(Math.sin(d * Math.PI * 2 + 4.188) * 127 + 128), x = (n * t + a) * 4;
        s[x] = m, s[x + 1] = p, s[x + 2] = S, s[x + 3] = 255;
      }
    this.ctx.putImageData(this.imageData, 0, 0);
  }
  animate() {
    const t = performance.now(), e = (t - this.lastTime) / 16.67;
    this.lastTime = t, this.time += 0.03 * this.speed * e, this.drawPlasma(), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const v = [
  "#ff0000",
  "#ff7f00",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ffffff",
  "#ff69b4",
  "#ffd700"
];
class L extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.particles = [], this.rockets = [], this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this), this.launchTimer = 0;
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "fireworks-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "fireworks-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
      .fireworks-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .fireworks-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(255, 200, 100, 0.8), 0 0 40px rgba(255, 100, 50, 0.6);
        z-index: 1;
        user-select: none;
      }
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.reducedMotion) {
      this.ctx.fillStyle = "#000000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height;
  }
  launchRocket() {
    const t = Math.random() * this.canvas.width;
    this.rockets.push({
      x: t,
      y: this.canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: -(Math.random() * 4 + 8),
      color: v[Math.floor(Math.random() * v.length)],
      targetY: Math.random() * this.canvas.height * 0.5 + 50
    });
  }
  explode(t) {
    const e = 80 + Math.floor(Math.random() * 40);
    for (let s = 0; s < e; s++) {
      const i = Math.PI * 2 * s / e + Math.random() * 0.2, n = Math.random() * 4 + 2;
      this.particles.push({
        x: t.x,
        y: t.y,
        vx: Math.cos(i) * n,
        vy: Math.sin(i) * n,
        color: t.color,
        life: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }
  animate() {
    const t = performance.now(), e = u(t, this.lastTime);
    this.lastTime = t, this.ctx.fillStyle = "rgba(0, 0, 0, 0.15)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.launchTimer += e * this.speed, this.launchTimer > 30 && (this.launchRocket(), this.launchTimer = 0);
    for (let s = this.rockets.length - 1; s >= 0; s--) {
      const i = this.rockets[s];
      i.x += i.vx * e * this.speed, i.y += i.vy * e * this.speed, i.vy += 0.1 * e * this.speed, this.ctx.beginPath(), this.ctx.arc(i.x, i.y, 2, 0, Math.PI * 2), this.ctx.fillStyle = i.color, this.ctx.fill(), (i.y <= i.targetY || i.vy > -2) && (this.explode(i), this.rockets.splice(s, 1));
    }
    for (let s = this.particles.length - 1; s >= 0; s--) {
      const i = this.particles[s];
      if (i.x += i.vx * e * this.speed, i.y += i.vy * e * this.speed, i.vy += 0.05 * e * this.speed, i.vx *= 0.99, i.vy *= 0.99, i.life -= i.decay * e * this.speed, i.life <= 0) {
        this.particles.splice(s, 1);
        continue;
      }
      this.ctx.beginPath(), this.ctx.arc(i.x, i.y, 2 * i.life, 0, Math.PI * 2), this.ctx.fillStyle = i.color + Math.floor(i.life * 255).toString(16).padStart(2, "0"), this.ctx.fill();
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const B = 30, g = [
  "rgba(255, 100, 100, 0.3)",
  "rgba(100, 255, 100, 0.3)",
  "rgba(100, 100, 255, 0.3)",
  "rgba(255, 255, 100, 0.3)",
  "rgba(255, 100, 255, 0.3)",
  "rgba(100, 255, 255, 0.3)"
];
class D extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.bubbles = [], this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this);
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "bubbles-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "bubbles-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
      .bubbles-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .bubbles-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 0 20px rgba(100, 200, 255, 0.8), 0 0 40px rgba(100, 150, 255, 0.5);
        z-index: 1;
        user-select: none;
      }
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.initBubbles(), this.reducedMotion) {
      this.drawBubbles();
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height;
  }
  initBubbles() {
    this.bubbles = [];
    for (let t = 0; t < B; t++)
      this.bubbles.push(this.createBubble());
  }
  createBubble(t = !1) {
    const e = Math.random() * 40 + 20;
    return {
      x: Math.random() * this.canvas.width,
      y: t ? this.canvas.height + e : Math.random() * this.canvas.height,
      radius: e,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 1 + 0.5),
      color: g[Math.floor(Math.random() * g.length)],
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.01
    };
  }
  drawBubble(t) {
    const { x: e, y: s, radius: i, color: n } = t, a = this.ctx.createRadialGradient(
      e - i * 0.3,
      s - i * 0.3,
      0,
      e,
      s,
      i
    );
    a.addColorStop(0, "rgba(255, 255, 255, 0.4)"), a.addColorStop(0.5, n), a.addColorStop(1, "rgba(0, 0, 0, 0.1)"), this.ctx.beginPath(), this.ctx.arc(e, s, i, 0, Math.PI * 2), this.ctx.fillStyle = a, this.ctx.fill(), this.ctx.beginPath(), this.ctx.arc(e - i * 0.3, s - i * 0.3, i * 0.2, 0, Math.PI * 2), this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)", this.ctx.fill(), this.ctx.beginPath(), this.ctx.arc(e, s, i - 2, 0, Math.PI * 2), this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)", this.ctx.lineWidth = 2, this.ctx.stroke();
  }
  drawBubbles() {
    this.ctx.fillStyle = "rgba(10, 20, 40, 1)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const t of this.bubbles)
      this.drawBubble(t);
  }
  animate() {
    const t = performance.now(), e = u(t, this.lastTime);
    this.lastTime = t, this.ctx.fillStyle = "rgba(10, 20, 40, 1)", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let s = 0; s < this.bubbles.length; s++) {
      const i = this.bubbles[s];
      i.wobbleOffset += i.wobbleSpeed * e * this.speed, i.x += (i.vx + Math.sin(i.wobbleOffset) * 0.3) * e * this.speed, i.y += i.vy * e * this.speed, i.y + i.radius < 0 && (this.bubbles[s] = this.createBubble(!0)), i.x < -i.radius && (i.x = this.canvas.width + i.radius), i.x > this.canvas.width + i.radius && (i.x = -i.radius), this.drawBubble(i);
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const y = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ff8800",
  "#88ff00"
], N = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: -1 }
];
class $ extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.pipes = [], this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this), this.gridSize = 30, this.pipeWidth = 12, this.resetTimer = 0;
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "pipes-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "pipes-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
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
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.initPipes(), this.reducedMotion) {
      for (let e = 0; e < 200; e++)
        this.updatePipes(1);
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height, this.ctx.fillStyle = "#000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  initPipes() {
    this.pipes = [], this.ctx.fillStyle = "#000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.addPipe();
  }
  addPipe() {
    const t = Math.floor(this.canvas.width / this.gridSize), e = Math.floor(this.canvas.height / this.gridSize);
    this.pipes.push({
      x: Math.floor(Math.random() * t) * this.gridSize + this.gridSize / 2,
      y: Math.floor(Math.random() * e) * this.gridSize + this.gridSize / 2,
      dir: Math.floor(Math.random() * 4),
      color: y[Math.floor(Math.random() * y.length)],
      segments: 0,
      maxSegments: 50 + Math.floor(Math.random() * 100)
    });
  }
  drawJoint(t, e, s) {
    const i = this.ctx.createRadialGradient(
      t - 3,
      e - 3,
      0,
      t,
      e,
      this.pipeWidth
    );
    i.addColorStop(0, "#ffffff"), i.addColorStop(0.3, s), i.addColorStop(1, this.darkenColor(s, 0.5)), this.ctx.beginPath(), this.ctx.arc(t, e, this.pipeWidth, 0, Math.PI * 2), this.ctx.fillStyle = i, this.ctx.fill();
  }
  drawPipeSegment(t, e, s, i, n) {
    const a = s - t, r = i - e, o = a !== 0, l = o ? this.ctx.createLinearGradient(t, e - this.pipeWidth, t, e + this.pipeWidth) : this.ctx.createLinearGradient(t - this.pipeWidth, e, t + this.pipeWidth, e);
    l.addColorStop(0, "#ffffff"), l.addColorStop(0.3, n), l.addColorStop(0.7, n), l.addColorStop(1, this.darkenColor(n, 0.4)), this.ctx.beginPath(), o ? this.ctx.rect(
      Math.min(t, s) - 2,
      e - this.pipeWidth / 2,
      Math.abs(a) + 4,
      this.pipeWidth
    ) : this.ctx.rect(
      t - this.pipeWidth / 2,
      Math.min(e, i) - 2,
      this.pipeWidth,
      Math.abs(r) + 4
    ), this.ctx.fillStyle = l, this.ctx.fill();
  }
  darkenColor(t, e) {
    const s = t.replace("#", ""), i = Math.floor(parseInt(s.substr(0, 2), 16) * e), n = Math.floor(parseInt(s.substr(2, 2), 16) * e), a = Math.floor(parseInt(s.substr(4, 2), 16) * e);
    return `rgb(${i}, ${n}, ${a})`;
  }
  updatePipes(t) {
    for (let e = this.pipes.length - 1; e >= 0; e--) {
      const s = this.pipes[e], i = N[s.dir], n = s.x + i.dx * this.gridSize, a = s.y + i.dy * this.gridSize;
      if (this.drawPipeSegment(s.x, s.y, n, a, s.color), this.drawJoint(n, a, s.color), s.x = n, s.y = a, s.segments++, s.segments >= s.maxSegments || n < 0 || n > this.canvas.width || a < 0 || a > this.canvas.height) {
        this.pipes.splice(e, 1), this.addPipe();
        continue;
      }
      if (Math.random() < 0.3) {
        const r = Math.random() < 0.5 ? 1 : -1;
        s.dir = (s.dir + r + 4) % 4;
      }
    }
  }
  animate() {
    const t = performance.now(), e = u(t, this.lastTime);
    this.lastTime = t, this.pipes.length < 3 && Math.random() < 0.02 && this.addPipe(), this.updatePipes(e), this.resetTimer += e * this.speed, this.resetTimer > 500 && (this.initPipes(), this.resetTimer = 0), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const w = ["#ff0088", "#00ff88", "#8800ff", "#ff8800"], F = 4, W = 20;
class G extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.polygons = [], this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this);
  }
  start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "mystify-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.textOverlay = document.createElement("div"), this.textOverlay.className = "mystify-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
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
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.initPolygons(), this.reducedMotion) {
      this.drawFrame();
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height;
  }
  initPolygons() {
    this.polygons = [];
    for (let t = 0; t < 2; t++) {
      const e = [];
      for (let s = 0; s < F; s++)
        e.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          history: []
        });
      this.polygons.push({
        vertices: e,
        color: w[t % w.length]
      });
    }
  }
  drawPolygon(t, e, s = 1) {
    if (!(t.length < 2)) {
      this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
      for (let i = 1; i < t.length; i++)
        this.ctx.lineTo(t[i].x, t[i].y);
      this.ctx.lineTo(t[0].x, t[0].y), this.ctx.strokeStyle = e, this.ctx.globalAlpha = s, this.ctx.lineWidth = 2, this.ctx.stroke(), this.ctx.globalAlpha = 1;
    }
  }
  drawFrame() {
    this.ctx.fillStyle = "#000000", this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (const t of this.polygons) {
      const e = t.vertices[0].history.length;
      for (let s = 0; s < e; s++) {
        const i = t.vertices.map((a) => a.history[s] || { x: a.x, y: a.y }), n = (s + 1) / (e + 1) * 0.5;
        this.drawPolygon(i, t.color, n);
      }
      this.drawPolygon(t.vertices, t.color, 1);
    }
  }
  animate() {
    const t = performance.now(), e = u(t, this.lastTime);
    this.lastTime = t;
    for (const s of this.polygons)
      for (const i of s.vertices)
        i.history.push({ x: i.x, y: i.y }), i.history.length > W && i.history.shift(), i.x += i.vx * e * this.speed, i.y += i.vy * e * this.speed, (i.x <= 0 || i.x >= this.canvas.width) && (i.vx *= -1, i.x = Math.max(0, Math.min(this.canvas.width, i.x))), (i.y <= 0 || i.y >= this.canvas.height) && (i.vy *= -1, i.y = Math.max(0, Math.min(this.canvas.height, i.y)));
    this.drawFrame(), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const q = "https://unpkg.com/three@0.160.0/build/three.module.js";
class H extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.textOverlay = null, this.THREE = null, this.scene = null, this.camera = null, this.renderer = null, this.tunnel = null, this.lastTime = 0, this._boundResize = this.resize.bind(this);
  }
  async start() {
    this.canvas = document.createElement("canvas"), this.canvas.className = "tunnel-canvas", this.container.appendChild(this.canvas), this.textOverlay = document.createElement("div"), this.textOverlay.className = "tunnel-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    t.textContent = `
      .tunnel-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .tunnel-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #00ffff);
        text-shadow: 0 0 20px #00ffff, 0 0 40px #0088ff, 0 0 60px #0044ff;
        z-index: 1;
        user-select: none;
      }
      .tunnel-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #00ffff;
        font-family: monospace;
        font-size: 1rem;
      }
    `, this.container.appendChild(t);
    const e = document.createElement("div");
    e.className = "tunnel-loading", e.textContent = "Loading 3D engine...", this.container.appendChild(e);
    try {
      if (this.THREE = await import(
        /* webpackIgnore: true */
        q
      ), e.remove(), this.reducedMotion) {
        this.setupStaticScene();
        return;
      }
      this.setupScene(), window.addEventListener("resize", this._boundResize), this.lastTime = performance.now(), this.animate();
    } catch (s) {
      e.textContent = "Failed to load 3D engine", console.error("Three.js load error:", s);
    }
  }
  setupScene() {
    const t = this.THREE, e = this.container.getBoundingClientRect();
    this.scene = new t.Scene(), this.scene.fog = new t.Fog(0, 1, 50), this.camera = new t.PerspectiveCamera(75, e.width / e.height, 0.1, 100), this.camera.position.z = 5, this.renderer = new t.WebGLRenderer({
      canvas: this.canvas,
      antialias: !0,
      alpha: !0
    }), this.renderer.setSize(e.width, e.height), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.createTunnel();
  }
  createTunnel() {
    const t = this.THREE;
    this.tunnelSegments = [];
    const e = 30, s = 2;
    for (let o = 0; o < e; o++) {
      const l = new t.TorusGeometry(3, 0.05, 8, 32), f = new t.MeshBasicMaterial({
        color: new t.Color().setHSL(o / e, 1, 0.5),
        transparent: !0,
        opacity: 0.8
      }), d = new t.Mesh(l, f);
      d.position.z = -o * s, d.rotation.x = Math.PI / 2, this.scene.add(d), this.tunnelSegments.push(d);
    }
    const i = 500, n = new t.BufferGeometry(), a = new Float32Array(i * 3);
    for (let o = 0; o < i; o++) {
      const l = Math.random() * Math.PI * 2, f = Math.random() * 2.5;
      a[o * 3] = Math.cos(l) * f, a[o * 3 + 1] = Math.sin(l) * f, a[o * 3 + 2] = Math.random() * -60;
    }
    n.setAttribute("position", new t.BufferAttribute(a, 3));
    const r = new t.PointsMaterial({
      color: 65535,
      size: 0.05,
      transparent: !0,
      opacity: 0.6
    });
    this.particles = new t.Points(n, r), this.scene.add(this.particles);
  }
  setupStaticScene() {
    const t = this.THREE, e = this.container.getBoundingClientRect();
    this.scene = new t.Scene(), this.camera = new t.PerspectiveCamera(75, e.width / e.height, 0.1, 100), this.camera.position.z = 5, this.renderer = new t.WebGLRenderer({
      canvas: this.canvas,
      antialias: !0,
      alpha: !0
    }), this.renderer.setSize(e.width, e.height), this.createTunnel(), this.renderer.render(this.scene, this.camera);
  }
  resize() {
    if (!this.renderer || !this.camera) return;
    const t = this.container.getBoundingClientRect();
    this.camera.aspect = t.width / t.height, this.camera.updateProjectionMatrix(), this.renderer.setSize(t.width, t.height);
  }
  animate() {
    const t = performance.now(), e = (t - this.lastTime) / 1e3;
    this.lastTime = t;
    const s = 10 * this.speed * e, n = this.tunnelSegments.length * 2;
    for (const r of this.tunnelSegments)
      r.position.z += s, r.rotation.z += e * 0.5 * this.speed, r.position.z > 5 && (r.position.z -= n);
    const a = this.particles.geometry.attributes.position.array;
    for (let r = 0; r < a.length; r += 3)
      a[r + 2] += s, a[r + 2] > 5 && (a[r + 2] -= 60);
    this.particles.geometry.attributes.position.needsUpdate = !0, this.particles.rotation.z += e * 0.2 * this.speed, this.renderer.render(this.scene, this.camera), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), this.renderer && this.renderer.dispose(), this.scene && this.scene.traverse((t) => {
      t.geometry && t.geometry.dispose(), t.material && (Array.isArray(t.material) ? t.material.forEach((e) => e.dispose()) : t.material.dispose());
    }), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const b = [
  // Purple gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23667eea'/%3E%3Cstop offset='100%25' stop-color='%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
  // Pink gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f093fb'/%3E%3Cstop offset='100%25' stop-color='%23f5576c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
  // Blue gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%234facfe'/%3E%3Cstop offset='100%25' stop-color='%2300f2fe'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
  // Green gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2343e97b'/%3E%3Cstop offset='100%25' stop-color='%2338f9d7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E"
];
class U extends c {
  constructor(t, e, s) {
    super(t, e, s), this.images = [], this.loadedImages = [], this.currentIndex = 0, this.currentSlide = null, this.nextSlide = null, this.textOverlay = null, this.slideDuration = 5e3, this.transitionDuration = 1e3, this.slideTimer = null, this.lastTime = 0;
  }
  start() {
    this.parseConfig(), this.wrapper = document.createElement("div"), this.wrapper.className = "slideshow-wrapper", this.container.appendChild(this.wrapper), this.currentSlide = document.createElement("div"), this.currentSlide.className = "slideshow-slide", this.wrapper.appendChild(this.currentSlide), this.nextSlide = document.createElement("div"), this.nextSlide.className = "slideshow-slide slideshow-next", this.wrapper.appendChild(this.nextSlide), this.textOverlay = document.createElement("div"), this.textOverlay.className = "slideshow-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    t.textContent = `
      .slideshow-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
      }
      .slideshow-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        opacity: 1;
        transition: opacity ${this.transitionDuration}ms ease-in-out;
      }
      .slideshow-next {
        opacity: 0;
      }
      .slideshow-slide.ken-burns {
        animation: kenBurns ${this.slideDuration + this.transitionDuration}ms ease-in-out;
      }
      @keyframes kenBurns {
        0% { transform: scale(1) translate(0, 0); }
        100% { transform: scale(1.1) translate(-2%, -2%); }
      }
      .slideshow-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--screen-saver-font-family, 'Arial Black', sans-serif);
        font-size: var(--screen-saver-font-size, 4rem);
        font-weight: bold;
        color: var(--screen-saver-text-color, #ffffff);
        text-shadow: 0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6);
        z-index: 2;
        user-select: none;
      }
      .slideshow-loading {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255,255,255,0.5);
        font-family: monospace;
        font-size: 0.8rem;
      }
    `, this.container.appendChild(t), this.preloadImages().then(() => {
      this.loadedImages.length === 0 && (console.warn("Slideshow: No images loaded, using defaults"), this.loadedImages = b), this.showSlide(0), this.reducedMotion || this.startSlideTimer();
    });
  }
  parseConfig() {
    var e;
    const t = this.container.closest("screen-saver") || ((e = this.container.getRootNode()) == null ? void 0 : e.host);
    if (t) {
      const s = t.getAttribute("data-images");
      s && (this.images = s.split(",").map((a) => a.trim()).filter(Boolean));
      const i = t.getAttribute("data-duration");
      i && (this.slideDuration = parseInt(i, 10));
      const n = t.getAttribute("data-transition");
      n && (this.transitionDuration = parseInt(n, 10));
    }
    this.images.length === 0 && (this.images = b);
  }
  async preloadImages() {
    const t = document.createElement("div");
    t.className = "slideshow-loading", t.textContent = "Loading images...", this.container.appendChild(t);
    const e = this.images.map((s, i) => new Promise((n) => {
      const a = new Image();
      a.onload = () => {
        this.loadedImages[i] = s, n(s);
      }, a.onerror = () => {
        console.warn(`Slideshow: Failed to load image: ${s}`), n(null);
      }, a.src = s;
    }));
    await Promise.all(e), this.loadedImages = this.loadedImages.filter(Boolean), t.remove();
  }
  showSlide(t) {
    if (this.loadedImages.length === 0) return;
    this.currentIndex = t % this.loadedImages.length;
    const e = this.loadedImages[this.currentIndex];
    this.currentSlide.style.backgroundImage = `url("${e}")`, this.currentSlide.style.opacity = "1", this.currentSlide.classList.remove("ken-burns"), this.reducedMotion || (this.currentSlide.offsetWidth, this.currentSlide.classList.add("ken-burns"));
  }
  nextSlideTransition() {
    if (this.loadedImages.length <= 1) return;
    const t = (this.currentIndex + 1) % this.loadedImages.length, e = this.loadedImages[t];
    this.nextSlide.style.backgroundImage = `url("${e}")`, this.nextSlide.classList.remove("ken-burns"), this.nextSlide.style.opacity = "1", this.currentSlide.style.opacity = "0", setTimeout(() => {
      const s = this.currentSlide;
      this.currentSlide = this.nextSlide, this.nextSlide = s, this.nextSlide.style.opacity = "0", this.currentIndex = t, this.reducedMotion || (this.currentSlide.offsetWidth, this.currentSlide.classList.add("ken-burns"));
    }, this.transitionDuration);
  }
  startSlideTimer() {
    this.slideTimer = setInterval(() => {
      this.nextSlideTransition();
    }, this.slideDuration);
  }
  destroy() {
    this.slideTimer && clearInterval(this.slideTimer), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const X = "linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
class Y extends c {
  constructor(t, e, s) {
    super(t, e, s), this.canvas = null, this.ctx = null, this.snowflakes = [], this.snowflakeCount = 200, this.wind = 0, this.windTarget = 0, this.backgroundUrl = null, this.lastTime = 0, this.textOverlay = null, this._boundResize = this.resize.bind(this);
  }
  start() {
    this.parseConfig(), this.backgroundLayer = document.createElement("div"), this.backgroundLayer.className = "snow-background", this.container.appendChild(this.backgroundLayer), this.canvas = document.createElement("canvas"), this.canvas.className = "snow-canvas", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.groundLayer = document.createElement("div"), this.groundLayer.className = "snow-ground", this.container.appendChild(this.groundLayer), this.textOverlay = document.createElement("div"), this.textOverlay.className = "snow-text", this.textOverlay.textContent = this.text, this.container.appendChild(this.textOverlay);
    const t = document.createElement("style");
    if (t.textContent = `
      .snow-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${this.backgroundUrl ? `url(${this.backgroundUrl})` : X};
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
    `, this.container.appendChild(t), this.resize(), window.addEventListener("resize", this._boundResize), this.initSnowflakes(), this.reducedMotion) {
      this.drawSnowflakes();
      return;
    }
    this.lastTime = performance.now(), this.animate();
  }
  parseConfig() {
    var e;
    const t = this.container.closest("screen-saver") || ((e = this.container.getRootNode()) == null ? void 0 : e.host);
    if (t) {
      this.backgroundUrl = t.getAttribute("data-background");
      const s = t.getAttribute("data-snowflakes");
      s && (this.snowflakeCount = parseInt(s, 10));
      const i = t.getAttribute("data-wind");
      i && (this.windTarget = parseFloat(i));
    }
  }
  resize() {
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width, this.canvas.height = t.height;
  }
  initSnowflakes() {
    this.snowflakes = [];
    for (let t = 0; t < this.snowflakeCount; t++)
      this.snowflakes.push(this.createSnowflake());
  }
  createSnowflake(t = !1) {
    const e = this.canvas, s = Math.random() * 3;
    return {
      x: Math.random() * e.width,
      y: t ? -10 : Math.random() * e.height,
      radius: 1 + s * 1.5,
      depth: s,
      speed: 0.5 + s * 0.5,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      opacity: 0.3 + s * 0.25
    };
  }
  drawSnowflakes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const t of this.snowflakes)
      this.ctx.beginPath(), this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity})`, this.ctx.fill(), t.radius > 2 && (this.ctx.beginPath(), this.ctx.arc(t.x, t.y, t.radius * 2, 0, Math.PI * 2), this.ctx.fillStyle = `rgba(200, 220, 255, ${t.opacity * 0.2})`, this.ctx.fill());
  }
  animate() {
    const t = performance.now(), e = (t - this.lastTime) / 16.67;
    this.lastTime = t, this.wind += (this.windTarget - this.wind) * 0.01, Math.random() < 2e-3 && (this.windTarget = (Math.random() - 0.5) * 2);
    for (let s = 0; s < this.snowflakes.length; s++) {
      const i = this.snowflakes[s];
      i.wobble += i.wobbleSpeed * e * this.speed;
      const n = Math.sin(i.wobble) * (1 + i.depth * 0.5);
      i.x += (n + this.wind * (1 + i.depth * 0.5)) * e * this.speed, i.y += i.speed * e * this.speed, i.y > this.canvas.height + 10 && (this.snowflakes[s] = this.createSnowflake(!0)), i.x < -10 ? i.x = this.canvas.width + 10 : i.x > this.canvas.width + 10 && (i.x = -10);
    }
    this.drawSnowflakes(), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("resize", this._boundResize), super.destroy();
  }
  updateText(t) {
    super.updateText(t), this.textOverlay && (this.textOverlay.textContent = t);
  }
}
const Z = {
  // Basic effects
  bounce3d: E,
  matrix: k,
  "ascii-glitch": R,
  starfield: A,
  plasma: P,
  fireworks: L,
  bubbles: D,
  pipes: $,
  mystify: G,
  // Advanced effects
  tunnel: H,
  slideshow: U,
  snow: Y
}, T = new Map(Object.entries(Z));
function J(h, t) {
  T.set(h, t);
}
function V(h) {
  return T.get(h) || E;
}
class K extends HTMLElement {
  static get observedAttributes() {
    return ["timeout", "effect", "speed", "background"];
  }
  /**
   * Register a custom effect.
   * @param {string} name - Effect name
   * @param {typeof Effect} effectClass - Effect class extending Effect
   */
  static registerEffect(t, e) {
    J(t, e);
  }
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._isActive = !1, this._idleTimer = null, this._activatedAt = null, this._effect = null, this._boundResetTimer = this._resetIdleTimer.bind(this), this._boundDismiss = this._handleDismiss.bind(this), this._boundSlotChange = this._handleSlotChange.bind(this), this._slotElement = null;
  }
  connectedCallback() {
    this._render(), this._startIdleDetection();
  }
  disconnectedCallback() {
    this._stopIdleDetection(), this.deactivate(), this._slotElement && (this._slotElement.removeEventListener("slotchange", this._boundSlotChange), this._slotElement = null);
  }
  attributeChangedCallback(t, e, s) {
    e !== s && (t === "timeout" ? this._resetIdleTimer() : t === "effect" && this._isActive ? (this._destroyEffect(), this._createEffect()) : t === "speed" && this._isActive && this._effect ? this._effect.speed = this.speed : t === "background" && this._isActive && this._updateBackground());
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
    e.classList.remove("active"), e.setAttribute("aria-hidden", "true"), this.isConnected && this._startIdleDetection(), this.dispatchEvent(new CustomEvent("screensaver-deactivate", {
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

        .slot-container {
          display: none;
        }
      </style>
      <div class="slot-container"><slot></slot></div>
      <div class="overlay" role="dialog" aria-label="Screen saver" aria-hidden="true">
        <div class="effect-container"></div>
      </div>
    `, this._slotElement = this.shadowRoot.querySelector("slot"), this._slotElement.addEventListener("slotchange", this._boundSlotChange);
  }
  _getSlotText() {
    return this.shadowRoot.querySelector("slot").assignedNodes({ flatten: !0 }).map((s) => s.textContent).join("").trim() || "Screen Saver";
  }
  _createEffect() {
    const t = this.shadowRoot.querySelector(".effect-container"), e = V(this.effect), s = this._getSlotText();
    this._effect = new e(t, s, this.speed), this._effect.start();
  }
  _destroyEffect() {
    this._effect && (this._effect.destroy(), this._effect = null);
  }
  _updateBackground() {
    const t = this.shadowRoot.querySelector(".overlay"), e = this.background;
    e ? e.startsWith("http") || e.startsWith("/") || e.startsWith("data:") ? (t.style.backgroundImage = `url(${e})`, t.style.backgroundSize = "cover", t.style.backgroundPosition = "center") : t.style.background = e : (t.style.backgroundImage = "", t.style.backgroundSize = "", t.style.backgroundPosition = "", t.style.background = "");
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
    if (Date.now() - this._activatedAt < 500) {
      this._attachDismissListeners();
      return;
    }
    this._isActive && this.deactivate();
  }
  _handleSlotChange() {
    if (!this._isActive || !this._effect) return;
    const t = this._getSlotText();
    typeof this._effect.updateText == "function" && this._effect.updateText(t);
  }
}
customElements.define("screen-saver", K);
export {
  R as AsciiGlitchEffect,
  E as Bounce3DEffect,
  D as BubblesEffect,
  c as Effect,
  L as FireworksEffect,
  k as MatrixEffect,
  G as MystifyEffect,
  $ as PipesEffect,
  P as PlasmaEffect,
  K as ScreenSaver,
  U as SlideshowEffect,
  Y as SnowEffect,
  A as StarfieldEffect,
  H as TunnelEffect,
  K as default
};
//# sourceMappingURL=screen-saver.js.map
