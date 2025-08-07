import {Page} from '@playwright/test';

export class BasePage {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    // Wait for the main app container to be visible
    await this.page.waitForSelector('.app-container', {state: 'visible'});

    // Wait for Monaco editor to load
    await this.page.waitForFunction(() => {
      return (window as any).monaco && (window as any).monaco.editor;
    });
  }

  async waitForStableUI() {
    // Wait for any animations or async operations to complete
    await this.page.waitForTimeout(500);
  }

  // Common utility methods
  async clickButton(text: string) {
    await this.page.click(`text="${text}"`);
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async pressKeys(keys: string[]) {
    for (const key of keys) {
      await this.page.keyboard.press(key);
    }
  }

  async screenshot(name: string) {
    await this.page.screenshot({path: `test-results/${name}.png`, fullPage: true});
  }
}
