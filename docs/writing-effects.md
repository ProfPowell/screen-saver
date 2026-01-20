# Writing Custom Screen Saver Effects

This guide explains how to create custom effects for the `<screen-saver>` web component.

## Effect Architecture

All effects extend the base `Effect` class from `src/effect.js`. The base class provides:

- Container element reference
- Text content from the slot
- Speed multiplier
- Reduced motion detection
- Animation frame management

## Basic Effect Structure

```javascript
import { Effect } from '../effect.js';

class MyEffect extends Effect {
  constructor(container, text, speed) {
    super(container, text, speed);
    // Initialize effect-specific properties
    this.canvas = null;
    this.ctx = null;
  }

  start() {
    // Set up DOM elements, canvas, styles
    this.setupCanvas();
    this.setupStyles();

    // Check for reduced motion preference
    if (this.reducedMotion) {
      this.drawStaticFrame();
      return;
    }

    // Start animation loop
    this.animate();
  }

  animate() {
    // Update and render frame
    this.update();
    this.draw();

    // Continue animation loop
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    // Clean up (base class cancels animationId)
    super.destroy();
  }

  updateText(text) {
    // Handle live text updates
    super.updateText(text);
    // Update any text elements
  }
}

export { MyEffect };
```

## Required Methods

### `start()`
Called when the screen saver activates. Set up all DOM elements, styles, and start animations here.

### `destroy()`
Called when the screen saver deactivates. Clean up event listeners, intervals, and DOM elements. Always call `super.destroy()` to cancel the animation frame.

### `updateText(text)` (optional)
Called when slot content changes while active. Implement this to support live text updates.

## The Base Effect Class

```javascript
class Effect {
  constructor(container, text, speed) {
    this.container = container;  // DOM element to render into
    this.text = text;            // Text from slot content
    this.speed = speed;          // Speed multiplier (default 1)
    this.animationId = null;     // For requestAnimationFrame
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  start() { /* Override this */ }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.container.innerHTML = '';
  }

  updateText(text) {
    this.text = text;
  }
}
```

## Animation Patterns

### Delta-Time Normalization

For smooth animations at any frame rate, normalize updates to 60fps:

```javascript
animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
  this.lastTime = currentTime;

  // Use deltaTime and this.speed for movement
  this.x += this.velocityX * deltaTime * this.speed;
  this.y += this.velocityY * deltaTime * this.speed;

  this.draw();
  this.animationId = requestAnimationFrame(() => this.animate());
}
```

### Respecting Reduced Motion

Always check `this.reducedMotion` and provide a static fallback:

```javascript
start() {
  this.setupElements();

  if (this.reducedMotion) {
    // Show static centered text instead of animation
    this.showStaticText();
    return;
  }

  this.animate();
}
```

## Adding External Dependencies

For effects that need external libraries (like Three.js), load them dynamically:

```javascript
class TunnelEffect extends Effect {
  async start() {
    // Show loading indicator
    this.showLoading();

    try {
      // Dynamic import from CDN
      const THREE_CDN = 'https://unpkg.com/three@0.160.0/build/three.module.js';
      this.THREE = await import(/* webpackIgnore: true */ THREE_CDN);

      // Now use THREE to set up the scene
      this.setupScene();
      this.animate();
    } catch (error) {
      console.error('Failed to load Three.js:', error);
      this.showFallback();
    }
  }
}
```

The `/* webpackIgnore: true */` comment prevents bundlers from trying to resolve the URL at build time.

## Configuration via Data Attributes

Effects can read configuration from the `<screen-saver>` element:

```javascript
parseConfig() {
  // Find the screen-saver parent element
  const screenSaver = this.container.closest('screen-saver') ||
                      this.container.getRootNode()?.host;

  if (screenSaver) {
    // Read data attributes
    const count = screenSaver.getAttribute('data-snowflakes');
    if (count) this.snowflakeCount = parseInt(count, 10);

    const wind = screenSaver.getAttribute('data-wind');
    if (wind) this.windFactor = parseFloat(wind);

    this.backgroundUrl = screenSaver.getAttribute('data-background');
  }
}
```

Usage in HTML:
```html
<screen-saver effect="snow"
  data-snowflakes="300"
  data-wind="0.5"
  data-background="winter-cabin.jpg">
  Let it Snow
</screen-saver>
```

## Scene Composition

For complex effects with multiple layers, create separate DOM elements:

```javascript
start() {
  // Background layer
  this.backgroundLayer = document.createElement('div');
  this.backgroundLayer.className = 'my-effect-bg';
  this.container.appendChild(this.backgroundLayer);

  // Canvas layer for animation
  this.canvas = document.createElement('canvas');
  this.canvas.className = 'my-effect-canvas';
  this.container.appendChild(this.canvas);

  // Text overlay layer
  this.textOverlay = document.createElement('div');
  this.textOverlay.className = 'my-effect-text';
  this.textOverlay.textContent = this.text;
  this.container.appendChild(this.textOverlay);

  // Add styles for layering
  const style = document.createElement('style');
  style.textContent = `
    .my-effect-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .my-effect-canvas {
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    .my-effect-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }
  `;
  this.container.appendChild(style);
}
```

## Registering Your Effect

Add your effect to the registry to make it available:

```javascript
// In your effect file
export { MyEffect };

// In src/effects/index.js
import { MyEffect } from './my-effect.js';

const defaultEffects = {
  // ... existing effects
  'my-effect': MyEffect,
};

export { MyEffect, defaultEffects };

// In src/screen-saver.js (imports)
import { MyEffect } from './effects/index.js';
export { MyEffect };
```

Or register at runtime:
```javascript
import { ScreenSaver } from './screen-saver.js';
import { MyEffect } from './my-effect.js';

ScreenSaver.registerEffect('my-effect', MyEffect);
```

## Example Effects

### Simple Canvas Effect (Starfield)

See `src/effects/starfield.js` for a classic flying-through-space effect using canvas 2D.

### External Library (Tunnel)

See `src/effects/tunnel.js` for Three.js integration with dynamic loading.

### Configurable Images (Slideshow)

See `src/effects/slideshow.js` for Ken Burns crossfade with `data-images` configuration.

### Scene Composition (Snow)

See `src/effects/snow.js` for multi-layer parallax with configurable background.

## Best Practices

1. **Always handle reduced motion** - Provide a static fallback for users who prefer reduced motion.

2. **Clean up properly** - Remove event listeners, clear intervals, and call `super.destroy()`.

3. **Use delta-time** - Normalize animations to frame rate for consistent speed across devices.

4. **Handle resize** - If using canvas, add a resize handler and remove it in `destroy()`.

5. **Respect the speed attribute** - Multiply velocities by `this.speed` for user control.

6. **Support text updates** - Implement `updateText()` for live slot content changes.

7. **Use CSS custom properties** - Read from `--screen-saver-*` properties for theming:
   ```javascript
   const textColor = getComputedStyle(this.container)
     .getPropertyValue('--screen-saver-text-color') || '#ffffff';
   ```

8. **Lazy load heavy dependencies** - Use dynamic imports for large libraries.

9. **Document data attributes** - If your effect accepts configuration, document it.

10. **Test with all effects** - Ensure switching between effects works cleanly.
