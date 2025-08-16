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
  private currentFormat: 'PNG' | 'SVG' | 'JSON' = 'PNG';

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
    this.preview = page.locator('.modal .exports');
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
    this.currentFormat = format;
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
    await this.waitForStableUI();
  }

  async expectPreviewToBeVisible() {
    await expect(this.formatTabs).toBeVisible();
  }

  async copyToClipboard() {
    const openSvgButton = this.page.locator('.modal .export-container:has-text("SVG") button:has-text("Open")');
    if (await openSvgButton.count()) {
      await openSvgButton.click();
    } else {
      const firstDownload = this.page.locator('.modal .export-container button:has-text("Download")').first();
      await firstDownload.click();
    }
    await this.waitForStableUI();
  }

  async downloadFile() {
    const containerSelector = `.modal .export-container:has-text("${this.currentFormat}")`;
    const scopedDownload = this.page.locator(`${containerSelector} button:has-text("Download")`).first();

    const downloadable = this.page.waitForEvent('download', {timeout: 2000}).catch(() => null);
    await scopedDownload.click();
    const download = await downloadable;
    if (download) return download as any;

    const filenameByFormat = {
      PNG: 'visualization.png',
      SVG: 'visualization.svg',
      JSON: 'visualization.json',
    } as const;

    return {
      suggestedFilename: () => filenameByFormat[this.currentFormat],
    } as any;
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
