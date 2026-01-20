/**
 * @fileoverview CSS injection utilities.
 */

/**
 * Inject styles into a container element.
 * Creates or reuses a style element with the given CSS.
 * @param {HTMLElement} container - Container to inject styles into
 * @param {string} css - CSS content to inject
 * @returns {HTMLStyleElement} The created/updated style element
 */
export function injectStyles(container, css) {
  let style = container.querySelector('style[data-effect-styles]');
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('data-effect-styles', '');
    container.appendChild(style);
  }
  style.textContent = css;
  return style;
}

/**
 * Remove injected styles from a container.
 * @param {HTMLElement} container - Container to remove styles from
 */
export function removeStyles(container) {
  const style = container.querySelector('style[data-effect-styles]');
  if (style) {
    style.remove();
  }
}
