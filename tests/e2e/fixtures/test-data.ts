// Test data for e2e tests

export const VALID_SPECS = {
  simpleBar: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: [
        {category: 'A', value: 28},
        {category: 'B', value: 55},
        {category: 'C', value: 43},
      ],
    },
    mark: 'bar',
    encoding: {
      x: {field: 'category', type: 'nominal'},
      y: {field: 'value', type: 'quantitative'},
    },
  },

  scatterPlot: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: [
        {x: 1, y: 28},
        {x: 2, y: 55},
        {x: 3, y: 43},
        {x: 4, y: 91},
        {x: 5, y: 81},
      ],
    },
    mark: 'point',
    encoding: {
      x: {field: 'x', type: 'quantitative'},
      y: {field: 'y', type: 'quantitative'},
    },
  },

  lineChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: [
        {x: 1, y: 28},
        {x: 2, y: 55},
        {x: 3, y: 43},
        {x: 4, y: 91},
        {x: 5, y: 81},
      ],
    },
    mark: 'line',
    encoding: {
      x: {field: 'x', type: 'quantitative'},
      y: {field: 'y', type: 'quantitative'},
    },
  },

  vegaSpec: {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    width: 400,
    height: 200,
    padding: 5,
    data: [
      {
        name: 'table',
        values: [
          {category: 1, amount: 28},
          {category: 2, amount: 55},
          {category: 3, amount: 43},
        ],
      },
    ],
    scales: [
      {
        name: 'xscale',
        type: 'band',
        domain: {data: 'table', field: 'category'},
        range: 'width',
        padding: 0.05,
      },
      {
        name: 'yscale',
        domain: {data: 'table', field: 'amount'},
        nice: true,
        range: 'height',
      },
    ],
    axes: [
      {orient: 'bottom', scale: 'xscale'},
      {orient: 'left', scale: 'yscale'},
    ],
    marks: [
      {
        type: 'rect',
        from: {data: 'table'},
        encode: {
          enter: {
            x: {scale: 'xscale', field: 'category'},
            width: {scale: 'xscale', band: 1},
            y: {scale: 'yscale', field: 'amount'},
            y2: {scale: 'yscale', value: 0},
          },
          update: {fill: {value: 'steelblue'}},
        },
      },
    ],
  },
};

export const INVALID_SPECS = {
  syntaxError: `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"values": [{"a": "A"}]},
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"}
  }
}`, // Missing closing bracket

  invalidMark: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {values: [{a: 'A', b: 28}]},
    mark: 'invalid-mark-type',
    encoding: {
      x: {field: 'a', type: 'nominal'},
      y: {field: 'b', type: 'quantitative'},
    },
  },

  missingData: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    mark: 'bar',
    encoding: {
      x: {field: 'a', type: 'nominal'},
      y: {field: 'b', type: 'quantitative'},
    },
  },

  invalidEncoding: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {values: [{a: 'A', b: 28}]},
    mark: 'bar',
    encoding: {
      x: {field: 'nonexistent', type: 'nominal'},
      y: {field: 'b', type: 'quantitative'},
    },
  },
};

export const TEST_GIST_IDS = {
  // These are example public gist IDs - replace with actual test gists if needed
  simpleBar: '455e1c7872c4b38a58b90df0c3d7b1b9',
  scatterPlot: 'f48e8cb861509c2a465a33b5fbb3a0a8',
  // Add more as needed for testing
};

export const EXAMPLE_SEARCH_TERMS = ['bar', 'scatter', 'line', 'histogram', 'area', 'pie', 'map'];

export const UI_SELECTORS = {
  // Common selectors that might be useful across tests
  modeSwitcher: '.mode-switcher-wrapper',
  examplesButton: '.header-button:has-text("Examples")',
  settingsButton: '.header-button:has-text("Settings")',
  exportButton: '.header-button:has-text("Export")',
  gistButton: '.header-button:has-text("Gist")',
  shareButton: '.header-button:has-text("Share")',
  visualization: '#vis',
  errorPane: '.error-pane',
  specEditor: '.monaco-editor',
};

export const VIEWPORT_SIZES = {
  desktop: {width: 1920, height: 1080},
  laptop: {width: 1366, height: 768},
  tablet: {width: 768, height: 1024},
  mobile: {width: 375, height: 667},
};

// Helper function to convert spec objects to JSON strings
export function specToString(spec: any): string {
  return JSON.stringify(spec, null, 2);
}
