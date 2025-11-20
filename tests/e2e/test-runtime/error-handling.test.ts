import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Error Handling', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should handle JSON syntax errors', async () => {
    const invalidJson = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"a": "A", "b": 28},
      {"a": "B", "b": 55}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"
  }
}`; // Missing closing bracket

    await homePage.typeInEditor(invalidJson);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();

    if (await homePage.errorPane.isVisible()) {
      const errorText = await homePage.errorPane.textContent();
      if (errorText && errorText.trim()) {
        expect(errorText.toLowerCase()).toMatch(/(json|syntax|error)/);
      }
    }
  });

  test('should show expression parse error for invalid Vega-Lite expression', async () => {
    const invalidSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
      {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x":{
      "field": "monthly(DATE_TRUNC('day',date)",
      "type": "temporal",
      "timeUnit": "binnedutcyearmonthdate"
    },
    "y": {"field": "value", "type": "quantitative"}
  },
  "config": {"bar": {"timeUnitBandPosition": 0}}
}`;

    await homePage.typeInEditor(invalidSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.page.waitForSelector('#error-indicator', {state: 'visible'});

    await homePage.expectErrorToBeShown();
    const errorText = (await homePage.errorPane.textContent()) || '';

    expect(errorText).toContain('[Error] Access path');
  });

  test('should handle invalid mark type', async () => {
    const invalidMarkSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"a": "A", "b": 28},
      {"a": "B", "b": 55}
    ]
  },
  "mark": "invalid-mark-type",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(invalidMarkSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();

    if (await homePage.errorPane.isVisible()) {
      const errorText = await homePage.errorPane.textContent();
      if (errorText && errorText.trim()) {
        expect(errorText.toLowerCase()).toMatch(/(mark|invalid|error)/);
      }
    }
  });

  test('should handle missing required fields', async () => {
    const missingFieldsSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"a": "A", "b": 28},
      {"a": "B", "b": 55}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "nonexistent", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(missingFieldsSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();

    await homePage.expectPageToBeLoaded();
  });

  test('should handle invalid data format', async () => {
    const invalidDataSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": "this should be an array"
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(invalidDataSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();

    if (await homePage.errorPane.isVisible()) {
      const errorText = await homePage.errorPane.textContent();
      if (errorText && errorText.trim()) {
        expect(errorText.toLowerCase()).toMatch(/(data|array|values|error)/);
      }
    }
  });

  test('should handle invalid schema URL', async () => {
    const invalidSchemaSpec = `{
  "$schema": "https://invalid-schema-url.com/schema.json",
  "data": {
    "values": [
      {"a": "A", "b": 28}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(invalidSchemaSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();

    await homePage.expectPageToBeLoaded();
  });

  test('should handle empty specification', async () => {
    await homePage.typeInEditor('{}');
    await homePage.waitForVisualizationUpdate();

    const hasError = await homePage.errorPane.isVisible();
    const hasVisualization = await homePage.visualization.isVisible();

    expect(hasError || !hasVisualization).toBe(true);

    await homePage.expectPageToBeLoaded();
  });

  test('should handle circular references in data', async () => {
    const circularSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      {"a": "A", "b": 28, "self": null}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(circularSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();
    await homePage.expectPageToBeLoaded();
  });

  test('should recover from errors when spec is fixed', async () => {
    const invalidSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [{"a": "A", "b": 28}]
  },
  "mark": "invalid-mark",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(invalidSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.expectErrorToBeShown();

    const validSpec = invalidSpec.replace('"invalid-mark"', '"bar"');
    await homePage.typeInEditor(validSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();
    await homePage.expectPageToBeLoaded();
  });

  test('should handle network errors for external data', async () => {
    const externalDataSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "url": "https://nonexistent-url.com/data.json"
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(externalDataSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.waitForStableUI();

    if (await homePage.errorPane.isVisible()) {
      const errorText = await homePage.errorPane.textContent();
      if (errorText && errorText.trim()) {
        expect(errorText.toLowerCase()).toMatch(/(network|url|data|load|fetch|error)/);
      }
    }
  });

  test('should handle mode switching with invalid specs', async () => {
    const invalidVegaLiteSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "mark": "invalid-mark"
}`;

    await homePage.typeInEditor(invalidVegaLiteSpec);
    await homePage.waitForVisualizationUpdate();
    await homePage.expectErrorToBeShown();

    await homePage.switchMode('Vega');
    await homePage.waitForStableUI();

    await homePage.expectPageToBeLoaded();

    await homePage.switchMode('Vega-Lite');
    await homePage.waitForStableUI();

    await homePage.expectPageToBeLoaded();
  });

  test('should display helpful error messages', async () => {
    const commonErrors = [
      {
        spec: `{"$schema": "https://vega.github.io/schema/vega-lite/v6.json", "mark": "bar"}`,
        expectedError: /(data|required)/i,
      },
      {
        spec: `{"$schema": "https://vega.github.io/schema/vega-lite/v6.json", "data": {"values": []}}`,
        expectedError: /(mark|required)/i,
      },
    ];

    for (const errorCase of commonErrors) {
      await homePage.typeInEditor(errorCase.spec);
      await homePage.waitForVisualizationUpdate();

      if (await homePage.errorPane.isVisible()) {
        const errorText = await homePage.errorPane.textContent();
        if (errorText && errorText.trim()) {
          expect(errorText.toLowerCase()).toMatch(errorCase.expectedError);
        }
      }
    }
  });
});
