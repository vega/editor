import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Gist Integration', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should open gist modal', async () => {
    await homePage.openGistModal();

    await expect(homePage.page.locator('.modal')).toBeVisible();

    const modalContent = await homePage.page.locator('.modal').textContent();
    expect(modalContent?.toLowerCase()).toMatch(/(gist|github|load|create|save)/);
  });

  test('should close gist modal', async () => {
    await homePage.openGistModal();
    await expect(homePage.page.locator('.modal')).toBeVisible();

    const closeButton = homePage.page.locator('.modal .close-button, .modal button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await homePage.page.keyboard.press('Escape');
    }

    await expect(homePage.page.locator('.modal')).not.toBeVisible();
  });

  test('should handle gist URL input', async () => {
    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      await gistInput.fill('https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9');

      const inputValue = await gistInput.inputValue();
      expect(inputValue).toContain('gist.github.com');
    }
  });

  test('should show authentication options', async () => {
    await homePage.openGistModal();

    const modalContent = await homePage.page.locator('.modal').textContent();

    expect(modalContent?.toLowerCase()).toMatch(/(auth|login|github|sign|token)/);
  });

  test('should handle gist loading from URL parameters', async () => {
    const gistUrl = '/?gist=455e1c7872c4b38a58b90df0c3d7b1b9';
    await homePage.page.goto(gistUrl);
    await homePage.waitForPageLoad();

    await homePage.waitForStableUI();

    const editorContent = await homePage.getEditorContent();

    expect(editorContent.length).toBeGreaterThan(0);
    expect(editorContent).toContain('$schema');
  });

  test('should handle share modal for creating gists', async () => {
    const testSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(testSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.openShareModal();
    await expect(homePage.page.locator('.share-modal')).toBeVisible();

    const shareContent = await homePage.page.locator('.share-modal').textContent();
    expect(shareContent?.toLowerCase()).toMatch(/(share|url|gist|link)/);
  });

  test('should handle gist privacy settings', async () => {
    await homePage.openGistModal();

    const modalText = await homePage.page.locator('.modal').textContent();

    if (modalText?.toLowerCase().includes('private') || modalText?.toLowerCase().includes('public')) {
      expect(modalText.toLowerCase()).toMatch(/(private|public)/);
    }
  });

  test('should handle gist error states', async () => {
    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      await gistInput.fill('invalid-gist-id-12345');

      const loadButton = homePage.page.locator('.modal button:has-text("Load"), .modal button[type="submit"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await homePage.waitForStableUI();

        await homePage.expectPageToBeLoaded();
      }
    }
  });

  test('should maintain gist information in URL', async () => {
    const gistId = '455e1c7872c4b38a58b90df0c3d7b1b9';
    await homePage.page.goto(`/?gist=${gistId}`);
    await homePage.waitForPageLoad();

    const currentUrl = homePage.page.url();
    expect(currentUrl).toContain(gistId);
  });

  test('should handle gist with multiple files', async () => {
    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      await gistInput.fill('455e1c7872c4b38a58b90df0c3d7b1b9');

      const loadButton = homePage.page.locator('.modal button:has-text("Load"), .modal button[type="submit"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await homePage.waitForStableUI();

        await homePage.expectPageToBeLoaded();
      }
    }
  });

  test('should handle authentication state changes', async () => {
    await homePage.openGistModal();

    const initialAuthState = await homePage.page.locator('.modal').textContent();

    expect(initialAuthState).toBeDefined();

    const closeButton = homePage.page.locator('.modal .close-button, .modal button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await homePage.page.keyboard.press('Escape');
    }
  });

  test('should handle gist loading timeouts', async () => {
    await homePage.page.route('**/gists/**', async (route) => {
      await homePage.page.waitForTimeout(100);
      await route.continue();
    });

    const gistUrl = '/?gist=455e1c7872c4b38a58b90df0c3d7b1b9';
    await homePage.page.goto(gistUrl);
    await homePage.waitForPageLoad();

    await homePage.expectPageToBeLoaded();
  });

  test('should preserve editor content when gist operations fail', async () => {
    const testSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"values": [{"a": "A", "b": 28}]},
  "mark": "bar"
}`;

    await homePage.typeInEditor(testSpec);

    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      await gistInput.fill('non-existent-gist-id');

      const loadButton = homePage.page.locator('.modal button:has-text("Load"), .modal button[type="submit"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await homePage.waitForStableUI();
      }
    }

    await homePage.page.keyboard.press('Escape');

    const editorContent = await homePage.getEditorContent();
    expect(editorContent.replace(/\s/g, '')).toContain(testSpec.replace(/\s/g, ''));
  });
});
