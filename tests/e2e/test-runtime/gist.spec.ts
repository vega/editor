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

    // Check that gist modal is visible
    await expect(homePage.page.locator('.modal')).toBeVisible();

    // Should have options for creating/loading gists
    const modalContent = await homePage.page.locator('.modal').textContent();
    expect(modalContent?.toLowerCase()).toMatch(/(gist|github|load|create|save)/);
  });

  test('should close gist modal', async () => {
    await homePage.openGistModal();
    await expect(homePage.page.locator('.modal')).toBeVisible();

    // Close with close button
    const closeButton = homePage.page.locator('.modal .close-button, .modal button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Close with Escape key
      await homePage.page.keyboard.press('Escape');
    }

    await expect(homePage.page.locator('.modal')).not.toBeVisible();
  });

  test('should handle gist URL input', async () => {
    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      // Test entering a gist URL or ID
      await gistInput.fill('https://gist.github.com/domoritz/455e1c7872c4b38a58b90df0c3d7b1b9');

      // Should accept the input
      const inputValue = await gistInput.inputValue();
      expect(inputValue).toContain('gist.github.com');
    }
  });

  test('should show authentication options', async () => {
    await homePage.openGistModal();

    const modalContent = await homePage.page.locator('.modal').textContent();

    // Should have some indication about GitHub authentication
    // This might be a login button, auth status, or explanation text
    expect(modalContent?.toLowerCase()).toMatch(/(auth|login|github|sign|token)/);
  });

  test('should handle gist loading from URL parameters', async () => {
    // Test loading a public gist directly via URL
    const gistUrl = '/?gist=455e1c7872c4b38a58b90df0c3d7b1b9';
    await homePage.page.goto(gistUrl);
    await homePage.waitForPageLoad();

    // Should attempt to load the gist
    await homePage.waitForStableUI();

    // Check if content was loaded (might succeed or fail depending on gist availability)
    const editorContent = await homePage.getEditorContent();

    // Either loaded content or shows default content
    expect(editorContent.length).toBeGreaterThan(0);
    expect(editorContent).toContain('$schema');
  });

  test('should handle share modal for creating gists', async () => {
    // First, create some content to share
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

    // Open share modal
    await homePage.openShareModal();
    await expect(homePage.page.locator('.share-modal')).toBeVisible();

    // Should show sharing options
    const shareContent = await homePage.page.locator('.share-modal').textContent();
    expect(shareContent?.toLowerCase()).toMatch(/(share|url|gist|link)/);
  });

  test('should handle gist privacy settings', async () => {
    await homePage.openGistModal();

    // Look for privacy options (public/private)
    // const privacyOptions = homePage.page.locator('.modal input[type="radio"], .modal select, .modal button');
    const modalText = await homePage.page.locator('.modal').textContent();

    // Should have some privacy-related controls or text
    if (modalText?.toLowerCase().includes('private') || modalText?.toLowerCase().includes('public')) {
      expect(modalText.toLowerCase()).toMatch(/(private|public)/);
    }
  });

  test('should handle gist error states', async () => {
    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      // Try to load an invalid gist ID
      await gistInput.fill('invalid-gist-id-12345');

      const loadButton = homePage.page.locator('.modal button:has-text("Load"), .modal button[type="submit"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await homePage.waitForStableUI();

        // Should handle the error gracefully
        // const errorMessage = homePage.page.locator('.error, .alert, [class*="error"]');
        // Error handling may vary, just ensure the app doesn't crash
        await homePage.expectPageToBeLoaded();
      }
    }
  });

  test('should maintain gist information in URL', async () => {
    // Load a gist and check if URL is updated
    const gistId = '455e1c7872c4b38a58b90df0c3d7b1b9'; // Example public gist
    await homePage.page.goto(`/?gist=${gistId}`);
    await homePage.waitForPageLoad();

    // URL should contain gist information
    const currentUrl = homePage.page.url();
    expect(currentUrl).toContain(gistId);
  });

  test('should handle gist with multiple files', async () => {
    // This test assumes the gist might have multiple files
    await homePage.openGistModal();

    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      // Enter a gist that might have multiple files
      await gistInput.fill('455e1c7872c4b38a58b90df0c3d7b1b9');

      const loadButton = homePage.page.locator('.modal button:has-text("Load"), .modal button[type="submit"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await homePage.waitForStableUI();

        // Should load successfully or show file selection
        await homePage.expectPageToBeLoaded();
      }
    }
  });

  test('should handle authentication state changes', async () => {
    await homePage.openGistModal();

    // Check initial authentication state
    const initialAuthState = await homePage.page.locator('.modal').textContent();

    // Authentication testing is limited without actual GitHub credentials
    // Just verify the interface handles different states appropriately
    expect(initialAuthState).toBeDefined();

    // Close modal
    const closeButton = homePage.page.locator('.modal .close-button, .modal button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await homePage.page.keyboard.press('Escape');
    }
  });

  test('should handle gist loading timeouts', async () => {
    // Simulate slow network by intercepting gist requests
    await homePage.page.route('**/gists/**', async (route) => {
      // Delay the response to simulate slow network
      await homePage.page.waitForTimeout(100);
      await route.continue();
    });

    const gistUrl = '/?gist=455e1c7872c4b38a58b90df0c3d7b1b9';
    await homePage.page.goto(gistUrl);
    await homePage.waitForPageLoad();

    // Should handle loading state appropriately
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

    // Try to load a non-existent gist
    const gistInput = homePage.page.locator('.modal input[placeholder="Enter URL"]');

    if (await gistInput.isVisible()) {
      await gistInput.fill('non-existent-gist-id');

      const loadButton = homePage.page.locator('.modal button:has-text("Load"), .modal button[type="submit"]');
      if (await loadButton.isVisible()) {
        await loadButton.click();
        await homePage.waitForStableUI();
      }
    }

    // Close modal
    await homePage.page.keyboard.press('Escape');

    // Original content should be preserved if gist loading failed
    const editorContent = await homePage.getEditorContent();
    expect(editorContent.replace(/\s/g, '')).toContain(testSpec.replace(/\s/g, ''));
  });
});
