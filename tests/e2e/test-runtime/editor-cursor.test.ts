import {test, expect, Page} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

// Regression test for https://github.com/vega/editor/issues/1512: in auto-run
// mode the caret jumped to the end of the spec and keystrokes were lost when a
// debounced update landed while the user kept typing.

const AUTO_RUN_DEBOUNCE_MS = 1200;

const SPEC = ['{', '  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",', '  "description": ""', '}'].join(
  '\n',
);

// Caret between the quotes of the (empty) description value.
const CARET = {lineNumber: 3, column: 19};

async function getSpecEditorState(page: Page) {
  return page.evaluate(() => {
    const editor = (window as any).monaco.editor.getEditors()[0];
    return {value: editor.getValue() as string, position: editor.getPosition() as {lineNumber: number; column: number}};
  });
}

async function focusSpecEditor(page: Page) {
  await page.evaluate(() => (window as any).monaco.editor.getEditors()[0].focus());
}

test.describe('Spec editor caret', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForStableUI();

    await page.evaluate(
      ({content, caret}) => {
        const editor = (window as any).monaco.editor.getEditors()[0];
        editor.setValue(content);
        editor.setPosition(caret);
        editor.focus();
      },
      {content: SPEC, caret: CARET},
    );
    // Let the update triggered by setValue settle before typing.
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);
  });

  test('keeps the caret and text while typing across auto-run updates', async ({page}) => {
    await page.keyboard.type('Obs', {delay: 50});

    // An unrelated state change re-renders the editor while the auto-run update is pending.
    await homePage.settingsButton.click();
    await focusSpecEditor(page);
    await page.keyboard.type('erv', {delay: 50});

    // The pending update(s) land here.
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);
    await page.keyboard.type('able10', {delay: 50});
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);

    const {value, position} = await getSpecEditorState(page);
    expect(value).toContain('"description": "Observable10"');
    expect(position).toEqual({lineNumber: CARET.lineNumber, column: CARET.column + 'Observable10'.length});
  });

  test('keeps the caret when the next keystroke follows an auto-run update immediately', async ({page}) => {
    await page.keyboard.type('Obs', {delay: 50});
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS - 50);
    await page.keyboard.type('ervable10', {delay: 20});
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);

    const {value, position} = await getSpecEditorState(page);
    expect(value).toContain('"description": "Observable10"');
    expect(position).toEqual({lineNumber: CARET.lineNumber, column: CARET.column + 'Observable10'.length});
  });
});
