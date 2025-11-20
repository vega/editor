import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Debug Viewers (Logs/Data/Signals/Dataflow)', () => {
  let homePage: HomePage;

  const vlSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {"values": [
    {"x": 1, "y": 28}, {"x": 2, "y": 55}, {"x": 3, "y": 43}
  ]},
  "mark": "point",
  "encoding": {"x": {"field": "x", "type": "quantitative"}, "y": {"field": "y", "type": "quantitative"}}
}`;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.typeInEditor(vlSpec);
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();
  });

  test('open debug pane and switch to Data Viewer', async () => {
    const debugHeader = homePage.page.locator('.pane-header');
    await expect(debugHeader).toBeVisible();
    await debugHeader.click();
    await homePage.waitForStableUI();

    await homePage.page.getByText('Data Viewer').click();
    await homePage.waitForStableUI();

    const dataViewer = homePage.page.locator('.data-viewer, .data-viewer-header, .data-table');
    await expect(dataViewer.first()).toBeVisible();

    const anyHeader = homePage.page.locator('.data-table table thead th').first();
    if (await anyHeader.isVisible()) {
      await anyHeader.click();
      await homePage.waitForStableUI();
    }
  });

  test('switch to Signal Viewer and start/stop recording', async () => {
    const debugHeader = homePage.page.locator('.pane-header');
    await debugHeader.click();
    await homePage.waitForStableUI();

    await homePage.page.getByText('Signal Viewer').click();
    await homePage.waitForStableUI();

    const recordBtn = homePage.page.getByRole('button', {name: 'Record signal changes'});
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();
    await homePage.waitForStableUI();

    const stopBtn = homePage.page.getByRole('button', {name: 'Stop Recording & Reset'});
    await stopBtn.click();
    await homePage.waitForStableUI();
  });

  test('open Dataflow Viewer', async () => {
    const debugHeader = homePage.page.locator('.pane-header');
    await debugHeader.click();
    await homePage.waitForStableUI();

    await homePage.page.getByText('Dataflow Viewer').click();
    await homePage.waitForStableUI();

    const dataflowPane = homePage.page.locator('.dataflow-pane, #error-indicator');
    await expect(dataflowPane.first()).toBeVisible();
  });
});
