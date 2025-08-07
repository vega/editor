import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './base-page';

export class ExportModal extends BasePage {
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly formatTabs: Locator;
  readonly pngTab: Locator;
  readonly svgTab: Locator;
  readonly jsonTab: Locator;
  readonly downloadButton: Locator;
  readonly copyButton: Locator;
  readonly preview: Locator;
  readonly scaleSlider: Locator;
  readonly qualitySlider: Locator;

  constructor(page: Page) {
    super(page);

    this.modal = page.locator('.modal');
    this.closeButton = page.locator('.modal .close-button');
    this.formatTabs = page.locator('.modal .exports');
    this.pngTab = page.locator('.modal .export-container:has-text("PNG")');
    this.svgTab = page.locator('.modal .export-container:has-text("SVG")');
    this.jsonTab = page.locator('.modal .export-container:has-text("JSON")');
    this.downloadButton = page.locator('.modal button:has-text("Download")');
    this.copyButton = page.locator('.modal .copy-icon');
    this.preview = page.locator('.modal .preview');
    this.scaleSlider = page.locator('.modal input[type="range"]');
    this.qualitySlider = page.locator('.modal input[type="range"]');
  }

  async expectModalToBeOpen() {
    await expect(this.modal).toBeVisible();
  }

  async expectModalToBeClosed() {
    await expect(this.modal).not.toBeVisible();
  }

  async close() {
    await this.closeButton.click();
    await this.expectModalToBeClosed();
  }

  async selectFormat(format: 'PNG' | 'SVG' | 'JSON') {
    switch (format) {
      case 'PNG':
        await this.pngTab.click();
        break;
      case 'SVG':
        await this.svgTab.click();
        break;
      case 'JSON':
        await this.jsonTab.click();
        break;
    }
    await this.waitForStableUI();
  }

  async setScale(scale: number) {
    await this.scaleSlider.fill(scale.toString());
    await this.waitForStableUI();
  }

  async expectPreviewToBeVisible() {
    await expect(this.preview).toBeVisible();
  }

  async copyToClipboard() {
    await this.copyButton.click();
    await this.waitForStableUI();
  }

  async downloadFile() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButton.click();
    const download = await downloadPromise;
    return download;
  }

  async getExportOptions(): Promise<string[]> {
    const containers = await this.formatTabs.locator('.export-container').all();
    const options = [];
    for (const container of containers) {
      const text = await container.locator('span').first().textContent();
      if (text) options.push(text.trim());
    }
    return options;
  }
}
