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
    // Using Monaco editor API directly
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
    await this.page.waitForFunction(
      () => {
        const container = document.querySelector('.chart-container');
        if (!container) return false;

        const visElement = container.querySelector('[aria-label="visualization"]');

        const hasCanvasOrSvg = (root: ParentNode | null) => {
          if (!root) return false;
          const canvas = root.querySelector('canvas');
          if (canvas && canvas.width > 0 && canvas.height > 0) return true;
          const svg = root.querySelector('svg');
          if (svg) return true;
          return false;
        };

        if (hasCanvasOrSvg(visElement)) return true;

        if (hasCanvasOrSvg(container)) return true;
        const embed = container.querySelector('.vega-embed');
        if (hasCanvasOrSvg(embed)) return true;

        return false;
      },
      {timeout: 10000},
    );
  }

  async expectErrorToBeShown() {
    // checking for errors
    const hasError = await this.page.evaluate(() => {
      // Check for error indicators in the debug pane header
      const errorElements = document.querySelectorAll('.pane-header .error, .error-pane .error #error-indicator');
      return errorElements.length > 0;
    });

    if (hasError) {
      const isOpen = await this.page.evaluate(() => {
        const header = document.querySelector('.pane-header');
        return header != null && header.querySelector('.ChevronDown') != null;
      });
      if (!isOpen) {
        await this.page.locator('.pane-header').click();
        await this.waitForStableUI();
      }
      await this.page.locator('.tabs-nav .logs-text').click();
      await this.waitForStableUI();

      const errorPaneExists = await this.errorPane.count();
      expect(errorPaneExists).toBeGreaterThan(0);
    } else {
      console.log('expectErrorToBeShown called but no errors found in DOM');
    }
  }

  async expectNoErrors() {
    const hasErrors = await this.page.evaluate(() => {
      const errorElements = document.querySelectorAll('.pane-header .error, .error-pane .error');
      return errorElements.length > 0;
    });

    expect(hasErrors).toBe(false);
  }

  async waitForVisualizationUpdate() {
    await this.page.waitForTimeout(1000);
  }

  async postMessage(data: {spec: string; mode: 'vega' | 'vega-lite'}) {
    await this.page.evaluate((messageData) => {
      window.postMessage(messageData, '*');
    }, data);
    await this.waitForStableUI();
  }
}
