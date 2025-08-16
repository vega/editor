import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';
import {ExportModal} from '../page-objects/export-modal';

test.describe('Export Functionality', () => {
  let homePage: HomePage;
  let exportModal: ExportModal;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    exportModal = new ExportModal(page);
    await homePage.goto();

    const simpleSpec = `{
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
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(simpleSpec);
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();
  });

  test('should open and close export modal', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.close();
    await exportModal.expectModalToBeClosed();
  });

  test('should display export format options', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    const exportOptions = await exportModal.getExportOptions();
    expect(exportOptions.length).toBeGreaterThan(0);

    const optionsText = exportOptions.join(' ').toLowerCase();
    expect(optionsText).toMatch(/(png|svg|pdf|json)/);
  });

  test('should export as PNG', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('PNG');
    await exportModal.expectPreviewToBeVisible();

    const download = await exportModal.downloadFile();
    expect(download.suggestedFilename()).toMatch(/\.(png|PNG)$/);

    await exportModal.close();
  });

  test('should export as SVG', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('SVG');
    await exportModal.expectPreviewToBeVisible();

    const download = await exportModal.downloadFile();
    expect(download.suggestedFilename()).toMatch(/\.(svg|SVG)$/);

    await exportModal.close();
  });

  test('should export spec as JSON', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('JSON');

    const download = await exportModal.downloadFile();
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.(json|JSON)$/);

    await exportModal.close();
  });

  test('should copy to clipboard', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.copyToClipboard();

    await homePage.waitForStableUI();

    await exportModal.close();
  });

  test('should handle export with different scales', async () => {
    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('PNG');

    await exportModal.setScale(2);
    await exportModal.expectPreviewToBeVisible();

    await exportModal.setScale(0.5);
    await exportModal.expectPreviewToBeVisible();

    await exportModal.close();
  });

  test('should export complex visualization', async () => {
    const complexSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "values": [
      {"x": 1, "y": 28, "category": "A"},
      {"x": 2, "y": 55, "category": "B"},
      {"x": 3, "y": 43, "category": "A"},
      {"x": 4, "y": 91, "category": "B"},
      {"x": 5, "y": 81, "category": "A"}
    ]
  },
  "mark": "point",
  "encoding": {
    "x": {"field": "x", "type": "quantitative"},
    "y": {"field": "y", "type": "quantitative"},
    "color": {"field": "category", "type": "nominal"},
    "size": {"field": "y", "type": "quantitative"}
  }
}`;

    await homePage.typeInEditor(complexSpec);
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();

    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('PNG');
    await exportModal.expectPreviewToBeVisible();

    const download = await exportModal.downloadFile();
    expect(download.suggestedFilename()).toMatch(/\.(png|PNG)$/);

    await exportModal.close();
  });

  test('should handle export errors gracefully', async () => {
    const problematicSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"values": []},
  "mark": "bar",
  "encoding": {}
}`;

    await homePage.typeInEditor(problematicSpec);
    await homePage.waitForVisualizationUpdate();

    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('PNG');

    await exportModal.close();
    await homePage.expectPageToBeLoaded();
  });

  test('should export from Vega mode', async () => {
    await homePage.switchMode('Vega');

    const vegaSpec = `{
  "$schema": "https://vega.github.io/schema/vega/v5.json",
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

    await homePage.typeInEditor(vegaSpec);
    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();

    await homePage.openExportModal();
    await exportModal.expectModalToBeOpen();

    await exportModal.selectFormat('SVG');
    const download = await exportModal.downloadFile();
    expect(download.suggestedFilename()).toMatch(/\.(svg|SVG)$/);

    await exportModal.close();
  });
});
