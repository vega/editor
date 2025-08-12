import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './base-page';

export class ExamplesModal extends BasePage {
  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly searchInput: Locator;
  readonly categoryTabs: Locator;
  readonly exampleGrid: Locator;
  readonly exampleItems: Locator;
  readonly loadButton: Locator;

  constructor(page: Page) {
    super(page);

    this.modal = page.locator('.modal');
    this.closeButton = page.locator('.modal .close-button');
    this.searchInput = page.locator('.modal input[type="search"]');
    this.categoryTabs = page.locator('.modal .button-groups');
    this.exampleGrid = page.locator('.modal .items');
    this.exampleItems = page.locator('.modal .item');
    this.loadButton = page.locator('.modal .load-button');
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

  async selectCategory(category: string) {
    await this.page.click(`.button-groups button:has-text("${category}")`);
    await this.waitForStableUI();
  }

  async getExampleCount(): Promise<number> {
    return await this.exampleItems.count();
  }

  async selectExample(name: string) {
    const example = this.page.locator(`.item:has(.name:text("${name}"))`).first();
    await example.click();
    await this.waitForStableUI();
  }

  async loadSelectedExample() {
    await this.waitForStableUI();
    await this.expectModalToBeClosed();
  }

  async loadExampleByName(name: string) {
    await this.selectExample(name);
    await this.loadSelectedExample();
  }

  async getAvailableCategories(): Promise<string[]> {
    const tabs = await this.categoryTabs.locator('button').all();
    const categories = [];
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text) categories.push(text.trim());
    }
    return categories;
  }

  async getExampleTitles(): Promise<string[]> {
    const items = await this.exampleItems.all();
    const titles = [];
    for (const item of items) {
      const title = await item.locator('.name').textContent();
      if (title) titles.push(title.trim());
    }
    return titles;
  }
}
