import { test, expect } from '@playwright/test';

test.describe('ScreenSaver Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/test-page.html');
  });

  test.describe('Basic Functionality', () => {
    test('should render without errors', async ({ page }) => {
      const screensaver = page.locator('screen-saver');
      await expect(screensaver).toBeAttached();
    });

    test('should have default attributes', async ({ page }) => {
      const screensaver = page.locator('screen-saver');
      await expect(screensaver).toHaveAttribute('effect', 'bounce3d');
    });

    test('should not be active initially', async ({ page }) => {
      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(false);
    });

    test('overlay should be hidden initially', async ({ page }) => {
      const overlay = page.locator('screen-saver').locator('.overlay').first();
      // Shadow DOM access
      const isVisible = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const overlay = ss.shadowRoot.querySelector('.overlay');
        return overlay.classList.contains('active');
      });
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Activation', () => {
    test('should activate programmatically', async ({ page }) => {
      await page.click('#activate');

      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(true);
    });

    test('should show overlay when active', async ({ page }) => {
      await page.click('#activate');

      const hasActiveClass = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const overlay = ss.shadowRoot.querySelector('.overlay');
        return overlay.classList.contains('active');
      });
      expect(hasActiveClass).toBe(true);
    });

    test('should fire screensaver-activate event', async ({ page }) => {
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          const ss = document.getElementById('screensaver');
          ss.addEventListener('screensaver-activate', () => resolve(true), { once: true });
          ss.activate();
        });
      });
      expect(eventFired).toBe(true);
    });
  });

  test.describe('Deactivation', () => {
    test('should deactivate programmatically', async ({ page }) => {
      await page.click('#activate');
      await page.waitForTimeout(100);

      // Deactivate via JS since overlay blocks clicks
      await page.evaluate(() => {
        document.getElementById('screensaver').deactivate();
      });

      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(false);
    });

    test('should deactivate on mouse move', async ({ page }) => {
      await page.click('#activate');
      await page.waitForTimeout(100);

      // Move mouse to trigger deactivation
      await page.mouse.move(100, 100);
      await page.waitForTimeout(100);

      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(false);
    });

    test('should deactivate on keypress', async ({ page }) => {
      await page.click('#activate');
      await page.waitForTimeout(100);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(false);
    });

    test('should fire screensaver-deactivate event with duration', async ({ page }) => {
      const duration = await page.evaluate(() => {
        return new Promise((resolve) => {
          const ss = document.getElementById('screensaver');
          ss.addEventListener('screensaver-deactivate', (e) => resolve(e.detail.duration), { once: true });
          ss.activate();
          setTimeout(() => ss.deactivate(), 100);
        });
      });
      expect(duration).toBeGreaterThanOrEqual(90);
    });
  });

  test.describe('Idle Detection', () => {
    test('should activate after timeout', async ({ page }) => {
      // Set a short timeout for testing
      await page.evaluate(() => {
        document.getElementById('screensaver').timeout = 1;
      });

      // Wait for idle timeout
      await page.waitForTimeout(1500);

      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(true);
    });

    test('should reset timer on user activity', async ({ page }) => {
      await page.evaluate(() => {
        document.getElementById('screensaver').timeout = 2;
      });

      // Move mouse before timeout
      await page.waitForTimeout(1000);
      await page.mouse.move(50, 50);
      await page.waitForTimeout(1000);
      await page.mouse.move(100, 100);

      const isActive = await page.evaluate(() => {
        return document.getElementById('screensaver').isActive;
      });
      expect(isActive).toBe(false);
    });
  });

  test.describe('Effects', () => {
    test('should display bounce3d effect', async ({ page }) => {
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.effect = 'bounce3d';
        ss.activate();
      });

      const hasEffect = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const container = ss.shadowRoot.querySelector('.effect-container');
        return container.querySelector('.bounce3d-text') !== null;
      });
      expect(hasEffect).toBe(true);
    });

    test('should display matrix effect', async ({ page }) => {
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.effect = 'matrix';
        ss.activate();
      });

      const hasEffect = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const container = ss.shadowRoot.querySelector('.effect-container');
        return container.querySelector('.matrix-canvas') !== null;
      });
      expect(hasEffect).toBe(true);
    });

    test('should display ascii-glitch effect', async ({ page }) => {
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.effect = 'ascii-glitch';
        ss.activate();
      });

      const hasEffect = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const container = ss.shadowRoot.querySelector('.effect-container');
        return container.querySelector('.glitch-wrapper') !== null;
      });
      expect(hasEffect).toBe(true);
    });

    test('should switch effects while active', async ({ page }) => {
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.effect = 'bounce3d';
        ss.activate();
      });

      await page.evaluate(() => {
        document.getElementById('screensaver').effect = 'matrix';
      });

      const hasMatrix = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const container = ss.shadowRoot.querySelector('.effect-container');
        return container.querySelector('.matrix-canvas') !== null;
      });
      expect(hasMatrix).toBe(true);
    });
  });

  test.describe('Slot Content', () => {
    test('should display slot text content', async ({ page }) => {
      await page.click('#activate');

      const text = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const container = ss.shadowRoot.querySelector('.effect-container');
        return container.textContent;
      });
      expect(text).toContain('Test Text');
    });

    test('should update when slot content changes', async ({ page }) => {
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.textContent = 'New Content';
        ss.activate();
      });

      // Deactivate and reactivate to see the new content
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.deactivate();
        ss.activate();
      });

      const text = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const container = ss.shadowRoot.querySelector('.effect-container');
        return container.textContent;
      });
      expect(text).toContain('New Content');
    });
  });

  test.describe('Accessibility', () => {
    test('overlay should have proper ARIA attributes', async ({ page }) => {
      const ariaLabel = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const overlay = ss.shadowRoot.querySelector('.overlay');
        return overlay.getAttribute('aria-label');
      });
      expect(ariaLabel).toBe('Screen saver');
    });

    test('overlay aria-hidden should reflect state', async ({ page }) => {
      // Initially hidden
      let ariaHidden = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const overlay = ss.shadowRoot.querySelector('.overlay');
        return overlay.getAttribute('aria-hidden');
      });
      expect(ariaHidden).toBe('true');

      // When active
      await page.click('#activate');
      ariaHidden = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const overlay = ss.shadowRoot.querySelector('.overlay');
        return overlay.getAttribute('aria-hidden');
      });
      expect(ariaHidden).toBe('false');
    });
  });

  test.describe('Speed Attribute', () => {
    test('should accept speed attribute', async ({ page }) => {
      await page.evaluate(() => {
        document.getElementById('screensaver').speed = 2;
      });

      const speed = await page.evaluate(() => {
        return document.getElementById('screensaver').speed;
      });
      expect(speed).toBe(2);
    });
  });

  test.describe('Background Attribute', () => {
    test('should apply background color', async ({ page }) => {
      await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        ss.background = '#ff0000';
        ss.activate();
      });

      const bg = await page.evaluate(() => {
        const ss = document.getElementById('screensaver');
        const overlay = ss.shadowRoot.querySelector('.overlay');
        return overlay.style.background;
      });
      expect(bg).toBe('rgb(255, 0, 0)');
    });
  });
});
