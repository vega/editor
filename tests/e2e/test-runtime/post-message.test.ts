import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('PostMessage Mode Switching', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should open spec in correct mode after postMessage', async () => {
    const vegaSpec = `{
    "$schema": "https://vega.github.io/schema/vega/v6.json",
    "width": 300,
    "height": 200,
    "data": [{"name": "table", "values": [{"x": 1, "y": 28}]}],
    "scales": [
      {"name": "x", "type": "linear", "domain": [0, 2], "range": "width"},
      {"name": "y", "type": "linear", "domain": [0, 30], "range": "height"}
    ],
    "marks": [
      {
        "type": "symbol",
        "from": {"data": "table"},
        "encode": {
          "enter": {
            "x": {"scale": "x", "field": "x"},
            "y": {"scale": "y", "field": "y"},
            "fill": {"value": "steelblue"}
          }
        }
      }
    ]
  }`;

    const vegaLiteSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "ordinal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}`;

    const initialMode = await homePage.getCurrentMode();
    expect(initialMode).toBe('Vega-Lite');

    await homePage.postMessage({
      spec: vegaSpec,
      mode: 'vega',
    });
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();
    await homePage.expectVisualizationToHaveContent();
    await homePage.expectNoErrors();
    const modeAfterVegaSpec = await homePage.getCurrentMode();
    expect(modeAfterVegaSpec).toBe('Vega');

    await homePage.postMessage({
      spec: vegaLiteSpec,
      mode: 'vega-lite',
    });
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();
    await homePage.expectVisualizationToHaveContent();
    await homePage.expectNoErrors();
    const modeAfterVegaLiteSpec = await homePage.getCurrentMode();
    expect(modeAfterVegaLiteSpec).toBe('Vega-Lite');
  });
});
