import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Help, Share and Fullscreen', () => {
  let homePage: HomePage;

  const vlSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"values": [{"a":"A","b":10},{"a":"B","b":20}]},
  "mark": "bar",
  "encoding": {"x":{"field":"a","type":"nominal"},"y":{"field":"b","type":"quantitative"}}
}`;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.typeInEditor(vlSpec);
    await homePage.waitForVisualizationUpdate();
  });

  test('open and close Help modal', async () => {
    await homePage.openHelpModal();
    await expect(homePage.page.locator('.help-modal')).toBeVisible();

    await homePage.page.locator('.modal .close-button').click();
    await expect(homePage.page.locator('.help-modal')).not.toBeVisible({timeout: 1000});
  });

  test('Share modal generates URL and copies', async () => {
    await homePage.openShareModal();
    const share = homePage.page.locator('.share-modal');
    await expect(share).toBeVisible();

    const fullscreenOpt = share.locator('input[name="fullscreen"]');
    const whitespaceOpt = share.locator('input[name="whitespace"]');
    await fullscreenOpt.check();
    await whitespaceOpt.check();

    await share.getByRole('button', {name: /Copy Link to Clipboard/}).click();
    await homePage.waitForStableUI();

    await homePage.page.locator('.modal .close-button').click();
  });

  test('visualization fullscreen open/close', async () => {
    const maximize = homePage.page.locator('.fullscreen-open');
    await expect(maximize).toBeVisible();
    await maximize.click();
    await homePage.waitForStableUI();

    await expect(homePage.page.locator('.fullscreen-chart')).toBeVisible();

    await homePage.page.getByRole('button', {name: 'Edit Visualization'}).click();
    await homePage.waitForStableUI();
    await expect(homePage.page.locator('.fullscreen-chart')).toHaveCount(0);
  });
});
