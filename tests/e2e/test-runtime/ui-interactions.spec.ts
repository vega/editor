import {test, expect, Page} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

async function dragBy(page: Page, locatorSelector: string, dx: number, dy: number) {
  const gutter = page.locator(locatorSelector).first();
  await page.waitForSelector(locatorSelector, {state: 'visible'});
  const box = await gutter.boundingBox();
  if (!box) throw new Error('Gutter bounding box not found');
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + dx, startY + dy, {steps: 10});
  await page.mouse.up();
}

test.describe('UI interactions - resizing', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForStableUI();
  });

  test('resize main split (input vs visualization) via gutter drag', async ({page}) => {
    const container = page.locator('.main-pane');
    await expect(container).toBeVisible();

    // react-split renders: pane1, gutter, pane2
    const leftPane = container.locator('> :not(.gutter)').first();
    const rightPane = container.locator('> :not(.gutter)').last();
    const gutter = container.locator('> .gutter');

    await expect(gutter).toBeVisible();

    const leftBefore = await leftPane.boundingBox();
    const rightBefore = await rightPane.boundingBox();
    expect(leftBefore && rightBefore).toBeTruthy();

    // Drag gutter to the right by 150px
    await dragBy(page, '.main-pane > .gutter', 150, 0);
    await homePage.waitForStableUI();

    const leftAfter = await leftPane.boundingBox();
    const rightAfter = await rightPane.boundingBox();
    expect(leftAfter && rightAfter).toBeTruthy();

    const leftDelta = (leftAfter!.width ?? 0) - (leftBefore!.width ?? 0);
    const rightDelta = (rightAfter!.width ?? 0) - (rightBefore!.width ?? 0);

    expect(Math.abs(leftDelta)).toBeGreaterThan(30);
    expect(Math.abs(rightDelta)).toBeGreaterThan(30);
    // Deltas should be opposite in sign
    expect(Math.sign(leftDelta)).toBe(-Math.sign(rightDelta));
  });

  test('resize editor vs compiled pane via gutter drag', async ({page}) => {
    // Ensure Vega-Lite mode where the vertical editor split exists
    await homePage.switchMode('Vega-Lite');
    const editorSplit = page.locator('.editor-splitPane');
    await page.waitForSelector('.editor-splitPane', {state: 'attached'});
    await page.evaluate(() => {
      const el = document.querySelector('.editor-splitPane');
      if (el && 'scrollIntoView' in el) (el as any).scrollIntoView({block: 'center', inline: 'center'});
    });

    const panes = editorSplit.locator('> :not(.gutter)');
    const topPane = panes.first();
    const bottomPane = panes.last();

    // Ensure gutter is present
    const gutter = editorSplit.locator('.gutter');
    await page.waitForSelector('.editor-splitPane .gutter', {state: 'visible'});

    const topBefore = await topPane.boundingBox();
    const bottomBefore = await bottomPane.boundingBox();
    expect(topBefore && bottomBefore).toBeTruthy();

    // Drag gutter upward by 100px to expand bottom pane
    await dragBy(page, '.editor-splitPane .gutter', 0, -100);
    await homePage.waitForStableUI();

    let topAfter = await topPane.boundingBox();
    let bottomAfter = await bottomPane.boundingBox();
    expect(topAfter && bottomAfter).toBeTruthy();

    let topDelta = (topAfter!.height ?? 0) - (topBefore!.height ?? 0);
    let bottomDelta = (bottomAfter!.height ?? 0) - (bottomBefore!.height ?? 0);

    if (Math.abs(topDelta) <= 2 && Math.abs(bottomDelta) <= 2) {
      // Retry with a larger drag if the first attempt didn't register
      await dragBy(page, '.editor-splitPane .gutter', 0, 200);
      await homePage.waitForStableUI();
      topAfter = await topPane.boundingBox();
      bottomAfter = await bottomPane.boundingBox();
      topDelta = (topAfter!.height ?? 0) - (topBefore!.height ?? 0);
      bottomDelta = (bottomAfter!.height ?? 0) - (bottomBefore!.height ?? 0);
    }

    expect(Math.max(Math.abs(topDelta), Math.abs(bottomDelta))).toBeGreaterThan(20);
    if (topDelta !== 0 && bottomDelta !== 0) {
      expect(Math.sign(topDelta)).toBe(-Math.sign(bottomDelta));
    }
  });
});
