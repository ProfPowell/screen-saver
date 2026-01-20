/**
 * @fileoverview Export all built-in effects.
 */

// Basic effects
import { Bounce3DEffect } from './bounce3d.js';
import { MatrixEffect } from './matrix.js';
import { AsciiGlitchEffect } from './ascii-glitch.js';
import { StarfieldEffect } from './starfield.js';
import { PlasmaEffect } from './plasma.js';
import { FireworksEffect } from './fireworks.js';
import { BubblesEffect } from './bubbles.js';
import { PipesEffect } from './pipes.js';
import { MystifyEffect } from './mystify.js';

// Advanced effects
import { TunnelEffect } from './tunnel.js';
import { SlideshowEffect } from './slideshow.js';
import { SnowEffect } from './snow.js';

/** Default effect mapping */
const defaultEffects = {
  // Basic effects
  'bounce3d': Bounce3DEffect,
  'matrix': MatrixEffect,
  'ascii-glitch': AsciiGlitchEffect,
  'starfield': StarfieldEffect,
  'plasma': PlasmaEffect,
  'fireworks': FireworksEffect,
  'bubbles': BubblesEffect,
  'pipes': PipesEffect,
  'mystify': MystifyEffect,
  // Advanced effects
  'tunnel': TunnelEffect,
  'slideshow': SlideshowEffect,
  'snow': SnowEffect,
};

export {
  // Basic effects
  Bounce3DEffect,
  MatrixEffect,
  AsciiGlitchEffect,
  StarfieldEffect,
  PlasmaEffect,
  FireworksEffect,
  BubblesEffect,
  PipesEffect,
  MystifyEffect,
  // Advanced effects
  TunnelEffect,
  SlideshowEffect,
  SnowEffect,
  // Registry
  defaultEffects,
};
