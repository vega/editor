import {test, expect} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';
import {ExamplesModal} from '../page-objects/examples-modal';

test.describe('Examples Functionality', () => {
  let homePage: HomePage;
  let examplesModal: ExamplesModal;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    examplesModal = new ExamplesModal(page);
    await homePage.goto();
  });

  test('should open and close examples modal', async () => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    await examplesModal.close();
    await examplesModal.expectModalToBeClosed();
  });

  test('should display example categories', async () => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    const categories = await examplesModal.getAvailableCategories();
    expect(categories.length).toBeGreaterThan(0);

    const categoryText = categories.join(' ').toLowerCase();
    expect(categoryText).toMatch(/(vega|lite)/);
  });

  test('should load a simple bar chart example', async () => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    await homePage.waitForStableUI();

    const exampleCount = await examplesModal.getExampleCount();
    expect(exampleCount).toBeGreaterThan(0);

    const exampleTitles = await examplesModal.getExampleTitles();

    if (exampleTitles.length > 0) {
      await examplesModal.loadExampleByName(exampleTitles[0]);

      await homePage.waitForVisualizationUpdate();
      await homePage.expectVisualizationToBeVisible();
      await homePage.expectVisualizationToHaveContent();

      const editorContent = await homePage.getEditorContent();
      expect(editorContent).toContain('$schema');
    }
  });

  test('should load examples in both Vega and Vega-Lite modes', async () => {
    await homePage.openExamples();

    const exampleTitles = await examplesModal.getExampleTitles();
    if (exampleTitles.length > 0) {
      await examplesModal.loadExampleByName(exampleTitles[0]);
      await homePage.waitForVisualizationUpdate();

      const editorContent = await homePage.getEditorContent();
      expect(editorContent).toContain('vega-lite');
      await homePage.expectVisualizationToBeVisible();
    }

    await homePage.switchMode('Vega');
    await homePage.openExamples();

    const vegaExamples = await examplesModal.getExampleTitles();
    if (vegaExamples.length > 0) {
      await examplesModal.loadExampleByName(vegaExamples[0]);
      await homePage.waitForVisualizationUpdate();

      const vegaContent = await homePage.getEditorContent();
      expect(vegaContent).toContain('"$schema"');
      expect(vegaContent).toContain('vega/v');
      await homePage.expectVisualizationToBeVisible();
    }
  });

  test('should display examples', async () => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    const exampleCount = await examplesModal.getExampleCount();
    expect(exampleCount).toBeGreaterThan(0);

    const titles = await examplesModal.getExampleTitles();
    expect(titles.length).toBeGreaterThan(0);

    for (const title of titles) {
      expect(title.trim()).toBeTruthy();
    }
  });

  test('should switch between example categories', async () => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    const categories = await examplesModal.getAvailableCategories();

    if (categories.length > 1) {
      await examplesModal.selectCategory(categories[1]);
      await homePage.waitForStableUI();

      const examplesInCategory = await examplesModal.getExampleCount();
      expect(examplesInCategory).toBeGreaterThan(0);

      await examplesModal.selectCategory(categories[0]);
      await homePage.waitForStableUI();

      const examplesInFirstCategory = await examplesModal.getExampleCount();
      expect(examplesInFirstCategory).toBeGreaterThan(0);
    }
  });

  test('should handle example loading errors gracefully', async () => {
    await homePage.openExamples();
    await examplesModal.expectModalToBeOpen();

    const titles = await examplesModal.getExampleTitles();
    if (titles.length > 0) {
      await homePage.page.route('**/spec/**', (route) => {
        if (Math.random() < 0.1) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await examplesModal.loadExampleByName(titles[0]);
      await homePage.waitForStableUI();

      await homePage.expectPageToBeLoaded();
    }
  });
});
