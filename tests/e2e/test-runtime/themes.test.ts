import {test, expect} from '@playwright/test';
import * as themes from 'vega-themes';
import {HomePage} from '../page-objects/home-page';

test.describe('Themes functionality', () => {
  let homePage: HomePage;

  const vlSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {"values": [{"a":"A","b":10},{"a":"B","b":20}]},
  "mark": "bar",
  "encoding": {"x":{"field":"a","type":"nominal"},"y":{"field":"b","type":"quantitative"}}
}`;

  async function openConfigTab(page) {
    const configTab = page.locator('.spec-editor-header .tabs-nav li:has-text("Config")');
    await configTab.click();
    await expect(page.locator('#config-select')).toBeVisible();
  }

  async function readDebugConfig(page) {
    return await page.evaluate(() => (window as any).VEGA_DEBUG?.config);
  }

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.typeInEditor(vlSpec);
    await homePage.waitForVisualizationUpdate();
  });

  test('selecting a theme updates runtime config', async ({page}) => {
    await openConfigTab(page);

    const darkTheme = (themes as any).dark;
    expect(darkTheme).toBeTruthy();

    await page.selectOption('#config-select', 'dark');
    await homePage.waitForVisualizationUpdate();

    const debugConfig = await readDebugConfig(page);
    expect(debugConfig).toBeTruthy();
    expect(debugConfig).toMatchObject(darkTheme);
  });

  test('switching between themes changes config, switching to custom resets it', async ({page}) => {
    await openConfigTab(page);

    const ggplot2 = (themes as any).ggplot2;
    const excel = (themes as any).excel;
    expect(ggplot2 && excel).toBeTruthy();

    await page.selectOption('#config-select', 'ggplot2');
    await homePage.waitForVisualizationUpdate();
    const cfg1 = await readDebugConfig(page);
    expect(cfg1).toMatchObject(ggplot2);

    await page.selectOption('#config-select', 'excel');
    await homePage.waitForVisualizationUpdate();
    const cfg2 = await readDebugConfig(page);
    expect(cfg2).toMatchObject(excel);

    expect(JSON.stringify(cfg1)).not.toEqual(JSON.stringify(cfg2));

    await page.selectOption('#config-select', 'custom');
    await homePage.waitForVisualizationUpdate();
    const cfg3 = await readDebugConfig(page);
    expect(cfg3).toEqual({});
  });
});
