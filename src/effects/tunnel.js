/**
 * @fileoverview Tunnel effect - 3D wireframe tunnel using Three.js
 *
 * This effect demonstrates loading an external dependency (Three.js)
 * dynamically at runtime to keep the core bundle small.
 */

import { Effect } from '../effect.js';

/** Three.js CDN URL */
const THREE_CDN = 'https://unpkg.com/three@0.160.0/build/three.module.js';

/**
 * 3D tunnel effect using Three.js.
 * Dynamically loads Three.js from CDN on first use.
 */
class TunnelEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.canvas = null;
    this.textOverlay = null;
    this.THREE = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.tunnel = null;
    this.lastTime = 0;
    this._boundResize = this.resize.bind(this);
  }

  async start() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'tunnel-canvas';
    this.container.appendChild(this.canvas);

    // Create text overlay
    this.textOverlay = document.createElement('div');
    this.textOverlay.className = 'tunnel-text';
    this.textOverlay.textContent = this.text;
    this.container.appendChild(this.textOverlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    this.container.appendChild(style);

    // Show loading indicator
    const loading = document.createElement('div');
    loading.className = 'tunnel-loading';
    loading.textContent = 'Loading 3D engine...';
    this.container.appendChild(loading);

    try {
      // Dynamically import Three.js
      this.THREE = await import(/* webpackIgnore: true */ THREE_CDN);
      loading.remove();

      if (this.reducedMotion) {
        this.setupStaticScene();
        return;
      }

      this.setupScene();
      window.addEventListener('resize', this._boundResize);
      this.lastTime = performance.now();
      this.animate();
    } catch (error) {
      loading.textContent = 'Failed to load 3D engine';
      console.error('Three.js load error:', error);
    }
  }

  setupScene() {
    const THREE = this.THREE;
    const rect = this.container.getBoundingClientRect();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 1, 50);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 100);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create tunnel geometry
    this.createTunnel();
  }

  createTunnel() {
    const THREE = this.THREE;

    // Create multiple ring segments for the tunnel
    this.tunnelSegments = [];
    const segmentCount = 30;
    const segmentDepth = 2;

    for (let i = 0; i < segmentCount; i++) {
      const geometry = new THREE.TorusGeometry(3, 0.05, 8, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / segmentCount, 1, 0.5),
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * segmentDepth;
      ring.rotation.x = Math.PI / 2;
      this.scene.add(ring);
      this.tunnelSegments.push(ring);
    }

    // Add some particles inside the tunnel
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.random() * -60;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);
  }

  setupStaticScene() {
    const THREE = this.THREE;
    const rect = this.container.getBoundingClientRect();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 100);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(rect.width, rect.height);

    this.createTunnel();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const rect = this.container.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  animate() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Move tunnel segments toward camera
    const moveSpeed = 10 * this.speed * deltaTime;
    const segmentDepth = 2;
    const totalDepth = this.tunnelSegments.length * segmentDepth;

    for (const ring of this.tunnelSegments) {
      ring.position.z += moveSpeed;
      ring.rotation.z += deltaTime * 0.5 * this.speed;

      // Wrap around when segment passes camera
      if (ring.position.z > 5) {
        ring.position.z -= totalDepth;
      }
    }

    // Move particles
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += moveSpeed;
      if (positions[i + 2] > 5) {
        positions[i + 2] -= 60;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.z += deltaTime * 0.2 * this.speed;

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    window.removeEventListener('resize', this._boundResize);

    // Clean up Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    super.destroy();
  }

  updateText(text) {
    super.updateText(text);
    if (this.textOverlay) {
      this.textOverlay.textContent = text;
    }
  }
}

export { TunnelEffect };
export default TunnelEffect;
