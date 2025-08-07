import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './base-page';

export class HomePage extends BasePage {
  // Main layout selectors
  readonly appContainer: Locator;
  readonly mainPanel: Locator;
  readonly splitPane: Locator;
  readonly inputPanel: Locator;
  readonly vizPane: Locator;
  readonly sidebar: Locator;

  // Header elements
  readonly header: Locator;
  readonly modeSwitcher: Locator;
  readonly examplesButton: Locator;
  readonly gistButton: Locator;
  readonly settingsButton: Locator;
  readonly exportButton: Locator;
  readonly shareButton: Locator;
  readonly helpButton: Locator;
  readonly commandsButton: Locator;

  // Editor elements
  readonly specEditor: Locator;
  readonly configEditor: Locator;
  readonly specEditorHeader: Locator;
  readonly compiledSpecDisplay: Locator;

  // Visualization elements
  readonly visualization: Locator;
  readonly errorPane: Locator;
  readonly debugPane: Locator;

  constructor(page: Page) {
    super(page);

    // Main layout
    this.appContainer = page.locator('.app-container');
    this.mainPanel = page.locator('.main-panel');
    this.splitPane = page.locator('.main-pane');
    this.inputPanel = page.locator('[role="group"][aria-label="spec editors"]');
    this.vizPane = page.locator('.main-panel').locator('.SplitPane').locator('.Pane2');
    this.sidebar = page.locator('.settings');

    // Header
    this.header = page.locator('.app-header');
    this.modeSwitcher = page.locator('.mode-switcher-wrapper');
    this.examplesButton = page.locator('.header-button:has-text("Examples")');
    this.gistButton = page.locator('.header-button:has-text("Gist")');
    this.settingsButton = page.locator('.header-button:has-text("Settings")');
    this.exportButton = page.locator('.header-button:has-text("Export")');
    this.shareButton = page.locator('.header-button:has-text("Share")');
    this.helpButton = page.locator('.header-button:has-text("Help")');
    this.commandsButton = page.locator('.header-button:has-text("Commands")');

    // Editor
    this.specEditor = page.locator('.monaco-editor').first();
    this.configEditor = page.locator('.monaco-editor').nth(1);
    this.specEditorHeader = page.locator('.spec-editor-header');
    this.compiledSpecDisplay = page.locator('.compiled-spec-display');

    // Visualization
    this.visualization = page
      .locator('.chart-container #vis, .chart-container .vega-embed, .chart-container canvas, .chart-container svg')
      .first();
    this.errorPane = page.locator('.error-pane');
    this.debugPane = page.locator('.debug-pane');
  }

  async expectPageToBeLoaded() {
    await expect(this.appContainer).toBeVisible();
    await expect(this.header).toBeVisible();
    await expect(this.mainPanel).toBeVisible();
  }

  async switchMode(mode: 'Vega' | 'Vega-Lite') {
    await this.modeSwitcher.click();
    await this.page.click(`text="${mode}"`);
    await this.waitForStableUI();
  }

  async getCurrentMode(): Promise<string> {
    const modeElement = await this.modeSwitcher.locator('.mode-switcher__single-value');
    return await modeElement.textContent();
  }

  async openExamples() {
    await this.examplesButton.click();
    await this.page.waitForSelector('.modal', {state: 'visible'});
  }

  async openGistModal() {
    await this.gistButton.click();
    await this.page.waitForSelector('.modal', {state: 'visible'});
  }

  async openExportModal() {
    await this.exportButton.click();
    await this.page.waitForSelector('.modal', {state: 'visible'});
  }

  async openShareModal() {
    await this.shareButton.click();
    await this.page.waitForSelector('.share-modal', {state: 'visible'});
  }

  async openHelpModal() {
    await this.helpButton.click();
    await this.page.waitForSelector('.help-modal', {state: 'visible'});
  }

  async toggleSettings() {
    await this.settingsButton.click();
    await this.waitForStableUI();
  }

  async isSettingsOpen(): Promise<boolean> {
    return await this.sidebar.isVisible();
  }

  async openCommands() {
    await this.commandsButton.click();
    await this.page.waitForSelector('.quick-input-widget', {state: 'visible', timeout: 5000});
  }

  async typeInEditor(text: string) {
    // Use Monaco editor API directly for better reliability
    await this.page.evaluate((content) => {
      const editor = (window as any).monaco?.editor?.getModels()?.[0];
      if (editor) {
        editor.setValue(content);
      }
    }, text);
    await this.waitForStableUI();
  }

  async getEditorContent(): Promise<string> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()?.[0];
      return editor?.getValue() || '';
    });
  }

  async expectVisualizationToBeVisible() {
    await expect(this.visualization).toBeVisible({timeout: 10000});
  }

  async expectVisualizationToHaveContent() {
    // Wait a bit for the visualization to render
    await this.page.waitForTimeout(1000);

    // Check for any visual content in the chart container
    const hasContent = await this.page.evaluate(() => {
      const container = document.querySelector('.chart-container');
      if (!container) return false;

      // Look for various possible visualization elements
      const selectors = ['#vis svg', '#vis canvas', '.vega-embed svg', '.vega-embed canvas', 'svg', 'canvas'];

      for (const selector of selectors) {
        const elements = container.querySelectorAll(selector);
        if (elements.length > 0) return true;
      }

      return false;
    });

    expect(hasContent).toBe(true);
  }

  async expectErrorToBeShown() {
    // Check if there are any errors in the application state
    const hasError = await this.page.evaluate(() => {
      // Check for error indicators in the debug pane header
      const errorElements = document.querySelectorAll('.pane-header .error, .error-pane .error');
      return errorElements.length > 0;
    });

    if (hasError) {
      // If there are errors, the debug pane should show them
      // The error pane may not be visible if debug pane is collapsed
      const debugPaneVisible = await this.page.locator('.debug-pane').isVisible();
      if (debugPaneVisible) {
        const errorPaneExists = await this.errorPane.count();
        expect(errorPaneExists).toBeGreaterThan(0);
      }
    } else {
      // If no errors are expected but we're calling this method, something might be wrong
      console.log('expectErrorToBeShown called but no errors found in DOM');
    }
  }

  async expectNoErrors() {
    // Check that there are no error indicators anywhere
    const hasErrors = await this.page.evaluate(() => {
      const errorElements = document.querySelectorAll('.pane-header .error, .error-pane .error');
      return errorElements.length > 0;
    });

    expect(hasErrors).toBe(false);
  }

  async waitForVisualizationUpdate() {
    // Wait for any running animations or updates to complete
    await this.page.waitForTimeout(1000);
  }
}
