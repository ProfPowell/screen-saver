/**
 * @fileoverview Timing utilities for animation frame management.
 */

/**
 * Normalize delta time to 60fps baseline.
 * @param {number} currentTime - Current timestamp from performance.now()
 * @param {number} lastTime - Previous frame timestamp
 * @returns {number} Normalized delta time (1.0 = 60fps frame)
 */
export function normalizeDeltaTime(currentTime, lastTime) {
  return (currentTime - lastTime) / 16.67; // 16.67ms = 60fps
}

/**
 * Check if frame should be skipped for throttling.
 * @param {number} deltaTime - Time since last frame in ms
 * @param {number} targetFPS - Target frames per second
 * @returns {boolean} True if frame should be skipped
 */
export function shouldSkipFrame(deltaTime, targetFPS) {
  const targetFrameTime = 1000 / targetFPS;
  return deltaTime < targetFrameTime;
}
