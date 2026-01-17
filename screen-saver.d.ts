/**
 * Screen Saver Web Component TypeScript Definitions
 */

/**
 * Base class for screen saver effects.
 */
export declare abstract class Effect {
  /** The container element to render into */
  protected container: HTMLElement;
  /** The text to display */
  protected text: string;
  /** Animation speed multiplier */
  protected speed: number;
  /** Current animation frame ID */
  protected animationId: number | null;
  /** Whether reduced motion is preferred */
  protected reducedMotion: boolean;

  constructor(container: HTMLElement, text: string, speed: number);

  /** Start the effect animation */
  abstract start(): void;

  /** Stop the effect animation */
  stop(): void;

  /** Clean up resources */
  destroy(): void;
}

/**
 * Classic bouncing 3D extruded text effect.
 */
export declare class Bounce3DEffect extends Effect {
  start(): void;
}

/**
 * Matrix-style falling character rain effect.
 */
export declare class MatrixEffect extends Effect {
  start(): void;
}

/**
 * Glitchy ASCII text effect.
 */
export declare class AsciiGlitchEffect extends Effect {
  start(): void;
}

/**
 * Event detail for screensaver-deactivate event.
 */
export interface ScreenSaverDeactivateEventDetail {
  /** Duration the screensaver was active in milliseconds */
  duration: number;
}

/**
 * Screen Saver Web Component
 *
 * @element screen-saver
 * @slot - Text content to display in the screen saver
 *
 * @fires screensaver-activate - When the screen saver activates
 * @fires screensaver-deactivate - When the screen saver dismisses
 */
export declare class ScreenSaver extends HTMLElement {
  /** Observed attributes for the component */
  static readonly observedAttributes: string[];

  /**
   * Register a custom effect.
   * @param name - Effect name
   * @param effectClass - Effect class extending Effect
   */
  static registerEffect(name: string, effectClass: typeof Effect): void;

  /** Whether the screen saver is currently active */
  readonly isActive: boolean;

  /** Idle delay in seconds before activation */
  timeout: number;

  /** Current effect name */
  effect: string;

  /** Animation speed multiplier */
  speed: number;

  /** Background color or image URL */
  background: string | null;

  /** Programmatically activate the screen saver */
  activate(): void;

  /** Programmatically deactivate the screen saver */
  deactivate(): void;

  addEventListener(
    type: 'screensaver-activate',
    listener: (this: ScreenSaver, ev: CustomEvent<void>) => void,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    type: 'screensaver-deactivate',
    listener: (this: ScreenSaver, ev: CustomEvent<ScreenSaverDeactivateEventDetail>) => void,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: 'screensaver-activate',
    listener: (this: ScreenSaver, ev: CustomEvent<void>) => void,
    options?: boolean | EventListenerOptions
  ): void;

  removeEventListener(
    type: 'screensaver-deactivate',
    listener: (this: ScreenSaver, ev: CustomEvent<ScreenSaverDeactivateEventDetail>) => void,
    options?: boolean | EventListenerOptions
  ): void;

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

export default ScreenSaver;

declare global {
  interface HTMLElementTagNameMap {
    'screen-saver': ScreenSaver;
  }
}
