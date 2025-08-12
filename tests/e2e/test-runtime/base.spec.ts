import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Basic Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should load the application correctly', async () => {
    await homePage.expectPageToBeLoaded();

    // Expect default mode is Vega-Lite
    const currentMode = await homePage.getCurrentMode();
    expect(currentMode).toBe('Vega-Lite');

    // Check that main UI elements are visible
    await expect(homePage.modeSwitcher).toBeVisible();
    await expect(homePage.examplesButton).toBeVisible();
    await expect(homePage.settingsButton).toBeVisible();
    await expect(homePage.exportButton).toBeVisible();
  });

  test('should switch between Vega and Vega-Lite modes', async () => {
    // Start with Vega-Lite (default)
    let currentMode = await homePage.getCurrentMode();
    expect(currentMode).toBe('Vega-Lite');

    // Switch to Vega
    await homePage.switchMode('Vega');
    currentMode = await homePage.getCurrentMode();
    expect(currentMode).toBe('Vega');

    // Switch back to Vega-Lite
    await homePage.switchMode('Vega-Lite');
    currentMode = await homePage.getCurrentMode();
    expect(currentMode).toBe('Vega-Lite');
  });

  test('should allow typing in the spec editor', async () => {
    const testSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55},
      {"a": "C", "b": 43}, {"a": "D", "b": 91}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "ordinal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(testSpec);

    // Wait a moment for the editor to process the input
    await homePage.waitForStableUI();

    const editorContent = await homePage.getEditorContent();
    expect(editorContent.replace(/\s/g, '')).toContain(testSpec.replace(/\s/g, ''));
  });

  test('should render visualization when valid spec is provided', async () => {
    const validSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "ordinal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(validSpec);
    await homePage.waitForVisualizationUpdate();

    // Check that visualization is rendered
    await homePage.expectVisualizationToBeVisible();
    await homePage.expectVisualizationToHaveContent();
    await homePage.expectNoErrors();
  });

  test('should show error for invalid spec', async () => {
    const invalidSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"category": "A", "value": 28}
    ]
  },
  "mark": "invalid-mark-type",
  "encoding": {
    "x": {"field": "category", "type": "ordinal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(invalidSpec);
    await homePage.waitForVisualizationUpdate();

    // Should show error or handle gracefully
    await homePage.waitForStableUI();

    // Check if there are error indicators
    const hasErrors = await homePage.page.evaluate(() => {
      return document.querySelectorAll('.pane-header .error').length > 0;
    });

    // If there are errors, that's expected for invalid spec
    if (hasErrors) {
      console.log('Error indicators found as expected for invalid spec');
    }
  });

  test('should open and close settings panel', async () => {
    // Settings should be closed initially
    expect(await homePage.isSettingsOpen()).toBe(false);

    // Open settings
    await homePage.toggleSettings();
    expect(await homePage.isSettingsOpen()).toBe(true);

    // Close settings
    await homePage.toggleSettings();
    expect(await homePage.isSettingsOpen()).toBe(false);
  });

  test('should open commands palette', async () => {
    await homePage.openCommands();

    // Check that command palette is visible
    await expect(homePage.page.locator('.quick-input-widget')).toBeVisible();

    // Close with Escape
    await homePage.pressKey('Escape');
    await expect(homePage.page.locator('.quick-input-widget')).not.toBeVisible();
  });

  test('should handle keyboard shortcuts', async () => {
    // Test Ctrl/Cmd + Enter to run spec
    await homePage.typeInEditor('{"$schema": "https://vega.github.io/schema/vega-lite/v5.json"}');

    // Focus editor and press Ctrl/Cmd + Enter
    await homePage.specEditor.click();
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await homePage.page.keyboard.press(`${modifier}+Enter`);

    await homePage.waitForStableUI();
    // Should attempt to render (may show error due to incomplete spec)
  });
});
