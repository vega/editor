import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Settings and Renderer', () => {
  let homePage: HomePage;

  const baseSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {"values": [
    {"c":"A","v":1}, {"c":"B","v":2}, {"c":"C","v":3}
  ]},
  "mark": "bar",
  "encoding": {"x":{"field":"c","type":"nominal"},"y":{"field":"v","type":"quantitative"}}
}`;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.typeInEditor(baseSpec);
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();
  });

  test('toggle settings and change background color', async () => {
    await homePage.toggleSettings();
    expect(await homePage.isSettingsOpen()).toBe(true);

    const colorInput = homePage.page.locator('.settings input[type="color"]');
    await expect(colorInput).toBeVisible();
    await colorInput.fill('#eeeeee');
    await homePage.waitForStableUI();

    const bg = await homePage.page.locator('.chart').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toMatch(/rgb\(238,\s*238,\s*238\)/);
  });

  test('switch renderer between SVG and Canvas', async () => {
    await homePage.toggleSettings();
    const svgRadio = homePage.page.locator('.settings input[type="radio"][value="svg"]');
    const canvasRadio = homePage.page.locator('.settings input[type="radio"][value="canvas"]');
    await expect(svgRadio).toBeVisible();
    await expect(canvasRadio).toBeVisible();

    await canvasRadio.click();
    await homePage.waitForVisualizationUpdate();
    const canvasCount = await homePage.page.locator('.chart-container canvas').count();
    expect(canvasCount).toBeGreaterThan(0);

    await svgRadio.click();
    await homePage.waitForVisualizationUpdate();
    const svgCount = await homePage.page.locator('.chart-container svg').count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('toggle tooltips and hover mode', async () => {
    await homePage.toggleSettings();

    const tooltips = homePage.page.locator('.settings #tooltip');
    await expect(tooltips).toBeVisible();
    const wasChecked = await tooltips.isChecked();
    await tooltips.click();
    expect(await tooltips.isChecked()).toBe(!wasChecked);

    const hoverSelect = homePage.page.locator('.hover-enable-dropdown-wrapper');
    await expect(hoverSelect).toBeVisible();
    await hoverSelect.click();
    await homePage.page.locator('.hover-enable-dropdown__option', {hasText: 'On'}).click();
    await homePage.waitForStableUI();

    await homePage.toggleSettings();
    expect(await homePage.isSettingsOpen()).toBe(false);
  });
});
