import {test, expect} from '@playwright/test';
import LZString from 'lz-string';
import {HomePage} from '../page-objects/home-page';

test.describe('Share functionality - Via URL', () => {
  let homePage: HomePage;

  const vlSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
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

  function extractCompressedFromUrl(url: string): {compressed: string; isFullscreen: boolean} {
    const hash = url.split('#')[1] || '';
    const match = hash.match(/#?\/url\/[^/]+\/([^#?]*)/);
    if (!match) throw new Error(`No compressed segment in URL: ${url}`);
    let compressed = match[1] ?? '';
    let isFullscreen = false;
    if (compressed.endsWith('/view')) {
      isFullscreen = true;
      compressed = compressed.replace(/\/view$/, '');
    }
    return {compressed, isFullscreen};
  }

  test('generates URL and compression roundtrip works', async ({page, context}) => {
    await homePage.openShareModal();

    const share = page.locator('.share-modal');
    await expect(share).toBeVisible();

    const fullscreenOpt = share.locator('input[name="fullscreen"]');
    const whitespaceOpt = share.locator('input[name="whitespace"]');

    if (await fullscreenOpt.isChecked()) await fullscreenOpt.uncheck();
    if (await whitespaceOpt.isChecked()) await whitespaceOpt.uncheck();

    const popupPromise = page.waitForEvent('popup');
    await share.getByRole('button', {name: /Open Link/}).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');

    const url = popup.url();
    expect(url).toMatch(/#\/url\/vega-lite\//);

    const {compressed, isFullscreen} = extractCompressedFromUrl(url);
    expect(isFullscreen).toBe(false);

    const decompressed = LZString.decompressFromEncodedURIComponent(compressed) ?? '';
    const expectedMin = JSON.stringify(JSON.parse(vlSpec));
    expect(decompressed).toBe(expectedMin);

    await expect(popup.locator('.app-container')).toBeVisible();
    await popup.waitForTimeout(500);
    const hasContent = await popup.evaluate(() => {
      const container = document.querySelector('.chart-container');
      if (!container) return false;
      const selectors = ['#vis svg', '#vis canvas', '.vega-embed svg', '.vega-embed canvas', 'svg', 'canvas'];
      for (const sel of selectors) {
        if ((container.querySelectorAll(sel) || []).length > 0) return true;
      }
      return false;
    });
    expect(hasContent).toBe(true);

    await popup.close();
  });

  test('whitespace option affects URL length and preserves content', async ({page}) => {
    await homePage.openShareModal();
    const share = page.locator('.share-modal');
    await expect(share).toBeVisible();

    const fullscreenOpt = share.locator('input[name="fullscreen"]');
    const whitespaceOpt = share.locator('input[name="whitespace"]');
    if (await fullscreenOpt.isChecked()) await fullscreenOpt.uncheck();
    if (await whitespaceOpt.isChecked()) await whitespaceOpt.uncheck();

    const popup1Promise = page.waitForEvent('popup');
    await share.getByRole('button', {name: /Open Link/}).click();
    const popup1 = await popup1Promise;
    await popup1.waitForLoadState('domcontentloaded');
    const url1 = popup1.url();
    const {compressed: comp1} = extractCompressedFromUrl(url1);
    const spec1 = LZString.decompressFromEncodedURIComponent(comp1) ?? '';
    const len1 = url1.length;
    await popup1.close();

    await whitespaceOpt.check();
    const popup2Promise = page.waitForEvent('popup');
    await share.getByRole('button', {name: /Open Link/}).click();
    const popup2 = await popup2Promise;
    await popup2.waitForLoadState('domcontentloaded');
    const url2 = popup2.url();
    const {compressed: comp2} = extractCompressedFromUrl(url2);
    const spec2 = LZString.decompressFromEncodedURIComponent(comp2) ?? '';
    const len2 = url2.length;

    expect(len1).toBeLessThanOrEqual(len2);

    expect(JSON.parse(spec1)).toEqual(JSON.parse(spec2));
    expect(JSON.parse(spec2)).toEqual(JSON.parse(vlSpec));

    await popup2.close();
  });

  test('fullscreen option appends /view and opens fullscreen viewer', async ({page}) => {
    await homePage.openShareModal();
    const share = page.locator('.share-modal');
    await expect(share).toBeVisible();

    const fullscreenOpt = share.locator('input[name="fullscreen"]');
    if (!(await fullscreenOpt.isChecked())) await fullscreenOpt.check();

    const popupPromise = page.waitForEvent('popup');
    await share.getByRole('button', {name: /Open Link/}).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');

    const url = popup.url();
    expect(url).toMatch(/#\/url\/vega-lite\/.*\/view$/);

    await expect(popup.locator('.fullscreen-chart')).toBeVisible();
    await popup.close();
  });
});
