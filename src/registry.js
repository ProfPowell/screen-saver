/**
 * @fileoverview Effect registry for managing available screen saver effects.
 */

import { defaultEffects, Bounce3DEffect } from './effects/index.js';

/** Registry of available effects */
const effectRegistry = new Map(Object.entries(defaultEffects));

/**
 * Register a custom effect.
 * @param {string} name - Effect name
 * @param {typeof import('./effect.js').Effect} effectClass - Effect class extending Effect
 */
export function registerEffect(name, effectClass) {
  effectRegistry.set(name, effectClass);
}

/**
 * Get an effect class by name.
 * @param {string} name - Effect name
 * @returns {typeof import('./effect.js').Effect} Effect class, defaults to Bounce3DEffect
 */
export function getEffect(name) {
  return effectRegistry.get(name) || Bounce3DEffect;
}

/**
 * Check if an effect is registered.
 * @param {string} name - Effect name
 * @returns {boolean} True if effect exists
 */
export function hasEffect(name) {
  return effectRegistry.has(name);
}

/**
 * Get all registered effect names.
 * @returns {string[]} Array of effect names
 */
export function getEffectNames() {
  return Array.from(effectRegistry.keys());
}

export { effectRegistry };
