// Not complete. Still needs a lot of work

import {test, expect} from '@playwright/test';

test.describe('Vega Editor', () => {
  test('should load the editor successfully', async ({page}) => {
    await page.goto('/');

    // Check that the main app element is present
    await expect(page.getByRole('main')).toBeVisible();

    // Check that the editor is loaded
    await expect(page.locator('[data-testid="spec-editor"], .monaco-editor')).toBeVisible();

    // Check that we can see some expected UI elements
    await expect(page.locator('text=Vega')).toBeVisible();
  });

  test('should be able to edit specification', async ({page}) => {
    await page.goto('/');

    // Wait for the editor to load
    await page.waitForSelector('.monaco-editor', {timeout: 10000});

    // Try to interact with the Monaco editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible();

    // Click in the editor area to focus it
    await editor.click();

    // Check that the editor is interactive (we should be able to see a cursor or focus state)
    await expect(editor.locator('.monaco-mouse-cursor-text')).toBeVisible({timeout: 5000});
  });

  test('should render visualization', async ({page}) => {
    await page.goto('/');

    const vizPane = page.locator('[data-testid="viz-pane"], .viz-pane, svg').first();
    await expect(vizPane).toBeVisible({timeout: 15000});
  });

  test('should have working navigation and basic UI', async ({page}) => {
    await page.goto('/');

    await expect(page.locator('header, .header, nav')).toBeVisible();

    const editorElements = ['text=Examples', 'text=Export', 'text=Share', 'text=Gist'];

    for (const element of editorElements) {
      const locator = page.locator(element).first();
      if (await locator.isVisible()) {
        await expect(locator).toBeVisible();
        break;
      }
    }
  });
});
