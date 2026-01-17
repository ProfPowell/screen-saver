# &lt;screen-saver&gt;

A vanilla JavaScript web component that displays retro screen saver effects after idle timeout.

## Features

- Zero dependencies - pure vanilla JavaScript
- Three built-in effects: bounce3d, matrix, ascii-glitch
- Automatic idle detection with configurable timeout
- Custom effect registration API
- Full CSS custom property support
- Respects `prefers-reduced-motion`
- TypeScript definitions included

## Installation

```bash
npm install screen-saver
```

Or use via CDN:

```html
<script type="module" src="https://unpkg.com/screen-saver/dist/screen-saver.js"></script>
```

## Usage

```html
<screen-saver timeout="180" effect="bounce3d">
  Your Text Here
</screen-saver>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeout` | number | `180` | Idle delay in seconds |
| `effect` | string | `"bounce3d"` | Effect name |
| `speed` | number | `1` | Animation speed multiplier |
| `background` | string | - | Background color or image URL |

## Available Effects

### bounce3d (default)
Classic bouncing 3D extruded text with color cycling on edge bounces.

### matrix
Matrix-style falling character rain with your text glowing in the center.

### ascii-glitch
Glitchy ASCII effect with random character corruption and chromatic aberration.

## API

```javascript
const el = document.querySelector('screen-saver');

// Programmatic control
el.activate();    // Start the screen saver
el.deactivate();  // Stop the screen saver
el.isActive;      // Check if active (readonly)

// Properties
el.timeout = 300;        // Set timeout
el.effect = 'matrix';    // Change effect
el.speed = 1.5;          // Adjust speed
```

## Events

```javascript
el.addEventListener('screensaver-activate', () => {
  console.log('Screen saver started');
});

el.addEventListener('screensaver-deactivate', (e) => {
  console.log(`Active for ${e.detail.duration}ms`);
});
```

## CSS Custom Properties

```css
screen-saver {
  --screen-saver-bg: rgba(0, 0, 0, 0.95);
  --screen-saver-text-color: #00ff00;
  --screen-saver-font-family: 'Arial Black', sans-serif;
  --screen-saver-font-size: 4rem;
  --screen-saver-z-index: 999999;
}
```

## Custom Effects

```javascript
import { ScreenSaver, Effect } from 'screen-saver';

class MyEffect extends Effect {
  start() {
    // Create your effect in this.container
    // Use this.text for the slot content
    // Use this.speed for animation speed
    // Check this.reducedMotion for accessibility
  }

  stop() {
    super.stop(); // Cancels requestAnimationFrame
  }

  destroy() {
    super.destroy(); // Full cleanup
  }
}

ScreenSaver.registerEffect('my-effect', MyEffect);
```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run tests
```

## License

MIT
