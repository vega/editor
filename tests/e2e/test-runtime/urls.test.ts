import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';
import {ExamplesModal} from '../page-objects/examples-modal';

test.describe('URL behavior', () => {
  let homePage: HomePage;
  let examplesModal: ExamplesModal;

  const vlSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"values": [{"a":"A","b":10},{"a":"B","b":20}]},
  "mark": "bar",
  "encoding": {"x":{"field":"a","type":"nominal"},"y":{"field":"b","type":"quantitative"}}
}`;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    examplesModal = new ExamplesModal(page);
    await homePage.goto();
  });

  test('URL updates to /examples/:mode/:name when an example is selected', async ({page}) => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    const titles = await examplesModal.getExampleTitles();
    expect(titles.length).toBeGreaterThan(0);

    await examplesModal.loadExampleByName(titles[0]);
    await homePage.waitForVisualizationUpdate();

    const url = page.url();
    expect(url).toMatch(/#\/examples\/(vega|vega-lite)\//);
  });

  test('URL becomes /edited after user edits the spec', async ({page}) => {
    // Seed with a valid spec, then edit it
    await homePage.typeInEditor(vlSpec);
    await homePage.waitForVisualizationUpdate();
    const current = await homePage.getEditorContent();
    await homePage.typeInEditor(current.replace('"bar"', '"line"'));
    await homePage.waitForVisualizationUpdate();

    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe('#/edited');
  });

  test('switching mode navigates to /custom/vega and /custom/vega-lite', async ({page}) => {
    await homePage.switchMode('Vega');
    await homePage.waitForStableUI();
    expect(page.url()).toMatch(/#\/custom\/vega$/);

    await homePage.switchMode('Vega-Lite');
    await homePage.waitForStableUI();
    expect(page.url()).toMatch(/#\/custom\/vega-lite$/);
  });

  test('fullscreen appends /view to the current route and is removed on exit', async ({page}) => {
    await homePage.typeInEditor(vlSpec);
    await homePage.waitForVisualizationUpdate();

    await page.locator('.fullscreen-open').click();
    await homePage.waitForStableUI();

    const urlAfterOpen = page.url();
    expect(urlAfterOpen).toMatch(/\/view$/);

    await page.getByRole('button', {name: 'Edit Visualization'}).click();
    await homePage.waitForStableUI();

    const urlAfterClose = page.url();
    expect(urlAfterClose).not.toMatch(/\/view$/);
  });
});
