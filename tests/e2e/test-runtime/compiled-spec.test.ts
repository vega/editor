import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

test.describe('Compiled Spec Pane', () => {
  let homePage: HomePage;

  const vlSpec = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "Bar chart",
  "data": {"values": [{"a": "A", "b": 5}, {"a": "B", "b": 3}]},
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal"},
    "y": {"field": "b", "type": "quantitative"}
  }
}`;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.typeInEditor(vlSpec);
    await homePage.waitForVisualizationUpdate();
  });

  test('open/close compiled pane and switch tabs', async () => {
    const compiledHeader = homePage.page.locator('.compiled-pane .editor-header');
    await expect(compiledHeader).toBeVisible();

    await compiledHeader.click();
    await homePage.waitForStableUI();

    await expect(homePage.page.getByText('Compiled Vega')).toBeVisible();
    await expect(
      homePage.page.locator('.compiled-pane .tabs-nav li', {hasText: 'Extended Vega-Lite Spec'}),
    ).toBeVisible();

    await homePage.page.locator('.compiled-pane .tabs-nav li', {hasText: 'Extended Vega-Lite Spec'}).click();
    await homePage.waitForStableUI();

    await expect(homePage.page.getByRole('button', {name: 'Edit Extended Vega-Lite Spec'})).toBeVisible();

    await homePage.page.getByText('Compiled Vega').click();
    await expect(homePage.page.getByRole('button', {name: 'Edit Vega Spec'})).toBeVisible();
  });

  test('Edit Vega Spec moves content to editor and switches mode', async () => {
    await homePage.page.locator('.compiled-pane .editor-header').click();
    await homePage.waitForStableUI();

    await expect(homePage.page.locator('.compiled-pane .monaco-editor')).toBeVisible();
    const editButton = homePage.page.locator('.compiled-pane .editor-header button');
    expect(editButton).toBeVisible();
    await editButton.click();
    await homePage.waitForStableUI();

    expect(homePage.page.url()).toContain('/edited');

    await homePage.waitForVisualizationUpdate();
    await homePage.expectVisualizationToBeVisible();
  });

  test('Edit Extended Vega-Lite Spec keeps mode as Vega-Lite', async () => {
    await homePage.page.locator('.compiled-pane .editor-header').click();
    await homePage.waitForStableUI();

    await homePage.page.locator('.compiled-pane .tabs-nav li', {hasText: 'Extended Vega-Lite Spec'}).click();
    await homePage.page
      .locator('.compiled-pane .editor-header button', {hasText: 'Edit Extended Vega-Lite Spec'})
      .click();

    expect(homePage.page.url()).toContain('/edited');
    const mode = await homePage.getCurrentMode();
    expect(mode).toBe('Vega-Lite');
  });
});
