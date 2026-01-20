/**
 * @fileoverview Reduced motion detection utility.
 */

/**
 * Check if the user prefers reduced motion.
 * @returns {boolean} True if reduced motion is preferred
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
