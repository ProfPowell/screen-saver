/**
 * @fileoverview Slideshow effect - Crossfade image slideshow
 *
 * This effect demonstrates:
 * - Configurable images via data attributes
 * - Image preloading and error handling
 * - Ken Burns zoom/pan animation
 * - Smooth crossfade transitions
 *
 * Usage:
 * <screen-saver effect="slideshow"
 *   data-images="url1.jpg,url2.jpg,url3.jpg"
 *   data-duration="5000"
 *   data-transition="1000">
 * </screen-saver>
 */

import { Effect } from '../effect.js';

/** Default placeholder images (abstract gradients using properly encoded SVG data URIs) */
const DEFAULT_IMAGES = [
  // Purple gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23667eea'/%3E%3Cstop offset='100%25' stop-color='%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
  // Pink gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f093fb'/%3E%3Cstop offset='100%25' stop-color='%23f5576c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
  // Blue gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%234facfe'/%3E%3Cstop offset='100%25' stop-color='%2300f2fe'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
  // Green gradient
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2343e97b'/%3E%3Cstop offset='100%25' stop-color='%2338f9d7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='800' height='600'/%3E%3C/svg%3E",
];

/**
 * Slideshow effect with Ken Burns animation and crossfade.
 * Images can be configured via data-images attribute.
 */
class SlideshowEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    this.images = [];
    this.loadedImages = [];
    this.currentIndex = 0;
    this.currentSlide = null;
    this.nextSlide = null;
    this.textOverlay = null;
    this.slideDuration = 5000;
    this.transitionDuration = 1000;
    this.slideTimer = null;
    this.lastTime = 0;
  }

  start() {
    // Parse configuration from container's parent (screen-saver element)
    this.parseConfig();

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'slideshow-wrapper';
    this.container.appendChild(this.wrapper);

    // Create slide containers
    this.currentSlide = document.createElement('div');
    this.currentSlide.className = 'slideshow-slide';
    this.wrapper.appendChild(this.currentSlide);

    this.nextSlide = document.createElement('div');
    this.nextSlide.className = 'slideshow-slide slideshow-next';
    this.wrapper.appendChild(this.nextSlide);

    // Create text overlay
    this.textOverlay = document.createElement('div');
    this.textOverlay.className = 'slideshow-text';
    this.textOverlay.textContent = this.text;
    this.container.appendChild(this.textOverlay);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    this.container.appendChild(style);

    // Preload images
    this.preloadImages().then(() => {
      if (this.loadedImages.length === 0) {
        console.warn('Slideshow: No images loaded, using defaults');
        this.loadedImages = DEFAULT_IMAGES;
      }

      // Start slideshow
      this.showSlide(0);

      if (!this.reducedMotion) {
        this.startSlideTimer();
      }
    });
  }

  parseConfig() {
    // Find the screen-saver parent element
    const screenSaver = this.container.closest('screen-saver') ||
                        this.container.getRootNode()?.host;

    if (screenSaver) {
      // Parse images from data-images attribute
      const imagesAttr = screenSaver.getAttribute('data-images');
      if (imagesAttr) {
        this.images = imagesAttr.split(',').map(url => url.trim()).filter(Boolean);
      }

      // Parse timing options
      const duration = screenSaver.getAttribute('data-duration');
      if (duration) this.slideDuration = parseInt(duration, 10);

      const transition = screenSaver.getAttribute('data-transition');
      if (transition) this.transitionDuration = parseInt(transition, 10);
    }

    // Use defaults if no images specified
    if (this.images.length === 0) {
      this.images = DEFAULT_IMAGES;
    }
  }

  async preloadImages() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'slideshow-loading';
    loadingIndicator.textContent = 'Loading images...';
    this.container.appendChild(loadingIndicator);

    const loadPromises = this.images.map((src, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.loadedImages[index] = src;
          resolve(src);
        };
        img.onerror = () => {
          console.warn(`Slideshow: Failed to load image: ${src}`);
          resolve(null);
        };
        img.src = src;
      });
    });

    await Promise.all(loadPromises);
    this.loadedImages = this.loadedImages.filter(Boolean);
    loadingIndicator.remove();
  }

  showSlide(index) {
    if (this.loadedImages.length === 0) return;

    this.currentIndex = index % this.loadedImages.length;
    const imageUrl = this.loadedImages[this.currentIndex];

    // Set current slide (quotes needed for data URIs with special characters)
    this.currentSlide.style.backgroundImage = `url("${imageUrl}")`;
    this.currentSlide.style.opacity = '1';
    this.currentSlide.classList.remove('ken-burns');

    // Trigger Ken Burns animation
    if (!this.reducedMotion) {
      // Force reflow
      void this.currentSlide.offsetWidth;
      this.currentSlide.classList.add('ken-burns');
    }
  }

  nextSlideTransition() {
    if (this.loadedImages.length <= 1) return;

    const nextIndex = (this.currentIndex + 1) % this.loadedImages.length;
    const nextImageUrl = this.loadedImages[nextIndex];

    // Prepare next slide (quotes needed for data URIs with special characters)
    this.nextSlide.style.backgroundImage = `url("${nextImageUrl}")`;
    this.nextSlide.classList.remove('ken-burns');

    // Crossfade
    this.nextSlide.style.opacity = '1';
    this.currentSlide.style.opacity = '0';

    // After transition, swap slides
    setTimeout(() => {
      // Swap references
      const temp = this.currentSlide;
      this.currentSlide = this.nextSlide;
      this.nextSlide = temp;

      this.nextSlide.style.opacity = '0';
      this.currentIndex = nextIndex;

      // Start Ken Burns on new current
      if (!this.reducedMotion) {
        void this.currentSlide.offsetWidth;
        this.currentSlide.classList.add('ken-burns');
      }
    }, this.transitionDuration);
  }

  startSlideTimer() {
    this.slideTimer = setInterval(() => {
      this.nextSlideTransition();
    }, this.slideDuration);
  }

  destroy() {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
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

export { SlideshowEffect };
export default SlideshowEffect;
