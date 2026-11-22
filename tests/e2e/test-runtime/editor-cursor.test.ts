import {test, expect, Page} from '@playwright/test';
import {HomePage} from '../page-objects/home-page';

const AUTO_RUN_DEBOUNCE_MS = 1200;
const CONFIG_DEBOUNCE_MS = 700;

// Spec editor is mounted first, the config editor second.
const SPEC_EDITOR = 0;
const CONFIG_EDITOR = 1;

type Position = {lineNumber: number; column: number};

const SPEC = ['{', '  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",', '  "description": ""', '}'].join(
  '\n',
);

// Caret between the quotes of the (empty) description value.
const CARET: Position = {lineNumber: 3, column: 19};

const after = (caret: Position, typed: string): Position => ({
  lineNumber: caret.lineNumber,
  column: caret.column + typed.length,
});

async function getEditorState(page: Page, index = SPEC_EDITOR) {
  return page.evaluate((i) => {
    const editor = (window as any).monaco.editor.getEditors()[i];
    return {value: editor.getValue() as string, position: editor.getPosition() as Position};
  }, index);
}

async function focusEditor(page: Page, index = SPEC_EDITOR) {
  await page.evaluate((i) => (window as any).monaco.editor.getEditors()[i].focus(), index);
}

/** Replaces the editor content (counts as a user edit) and puts the caret at `caret`. */
async function seedEditor(page: Page, content: string, caret: Position, index = SPEC_EDITOR) {
  await page.evaluate(
    ({i, text, position}) => {
      const editor = (window as any).monaco.editor.getEditors()[i];
      editor.setValue(text);
      editor.setPosition(position);
      editor.focus();
    },
    {i: index, text: content, position: caret},
  );
}

async function undo(page: Page, index = SPEC_EDITOR) {
  await page.evaluate((i) => (window as any).monaco.editor.getEditors()[i].trigger('test', 'undo', null), index);
}

async function openConfigTab(page: Page) {
  await page.locator('.spec-editor-header .tabs-nav li:has-text("Config")').click();
  await expect(page.locator('#config-select')).toBeVisible();
  await page.waitForFunction(() => (window as any).monaco.editor.getEditors().length > 1);
}

test.describe('Spec editor caret', () => {
  let homePage: HomePage;

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForStableUI();

    await seedEditor(page, SPEC, CARET);
    // Let the update triggered by setValue settle before typing.
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);
  });

  test('keeps the caret and text while typing across auto-run updates', async ({page}) => {
    await page.keyboard.type('Obs', {delay: 50});

    // An unrelated state change re-renders the editor while the auto-run update is pending.
    await homePage.settingsButton.click();
    await focusEditor(page);
    await page.keyboard.type('erv', {delay: 50});

    // The pending update(s) land here.
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);
    await page.keyboard.type('able10', {delay: 50});
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);

    const {value, position} = await getEditorState(page);
    expect(value).toContain('"description": "Observable10"');
    expect(position).toEqual(after(CARET, 'Observable10'));
  });

  test('keeps the caret when the next keystroke follows an auto-run update immediately', async ({page}) => {
    await page.keyboard.type('Obs', {delay: 50});
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS - 50);
    await page.keyboard.type('ervable10', {delay: 20});
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);

    const {value, position} = await getEditorState(page);
    expect(value).toContain('"description": "Observable10"');
    expect(position).toEqual(after(CARET, 'Observable10'));
  });

  test('shows a spec loaded from outside the editor, keeps the caret and the undo history', async ({page}) => {
    await page.keyboard.type('Obs', {delay: 50});
    const typedSpec = (await getEditorState(page)).value;

    const loaded = SPEC.replace('"description": ""', '"description": "Loaded elsewhere"');
    await homePage.postMessage({spec: loaded, mode: 'vega-lite'});

    let state = await getEditorState(page);
    expect(state.value).toBe(loaded);
    // The caret stays where it was instead of jumping to the end of the document.
    expect(state.position).toEqual(after(CARET, 'Obs'));

    // The typing that had not been sent yet must not overwrite the loaded spec.
    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);
    state = await getEditorState(page);
    expect(state.value).toBe(loaded);

    // Loading from outside is an undoable edit.
    await undo(page);
    expect((await getEditorState(page)).value).toBe(typedSpec);
  });

  test('discards unsent typing when the mode is switched', async ({page}) => {
    await page.keyboard.type('Obs', {delay: 50});
    await homePage.switchMode('Vega');

    let {value} = await getEditorState(page);
    expect(value).toMatch(/schema\/vega\/v\d/);

    await page.waitForTimeout(AUTO_RUN_DEBOUNCE_MS + 300);
    ({value} = await getEditorState(page));
    expect(value).toMatch(/schema\/vega\/v\d/);
    expect(value).not.toContain('Obs');
  });

  test('keeps the caret and text while typing in manual mode', async ({page}) => {
    await page.locator('.auto-run__dropdown-indicator').click();
    await page.locator('.auto-run__option:has-text("Manual")').click();
    await expect(page.locator('#run-button .parse-mode')).toHaveText('Manual');

    await focusEditor(page);
    await page.keyboard.type('Obs', {delay: 50});
    await homePage.settingsButton.click();
    await focusEditor(page);
    await page.keyboard.type('ervable10', {delay: 50});

    const {value, position} = await getEditorState(page);
    expect(value).toContain('"description": "Observable10"');
    expect(position).toEqual(after(CARET, 'Observable10'));
  });
});

test.describe('Config editor caret', () => {
  let homePage: HomePage;

  const CONFIG = ['{', '  "background": ""', '}'].join('\n');
  // Caret between the quotes of the (empty) background value.
  const CONFIG_CARET: Position = {lineNumber: 2, column: 18};

  test.beforeEach(async ({page}) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForStableUI();
    await openConfigTab(page);
  });

  test('keeps the caret and text while typing across config updates', async ({page}) => {
    await seedEditor(page, CONFIG, CONFIG_CARET, CONFIG_EDITOR);
    await page.waitForTimeout(CONFIG_DEBOUNCE_MS + 300);

    await page.keyboard.type('whi', {delay: 50});
    await homePage.settingsButton.click();
    await focusEditor(page, CONFIG_EDITOR);
    await page.keyboard.type('te', {delay: 50});
    await page.waitForTimeout(CONFIG_DEBOUNCE_MS + 300);

    const {value, position} = await getEditorState(page, CONFIG_EDITOR);
    expect(value).toContain('"background": "white"');
    expect(position).toEqual(after(CONFIG_CARET, 'white'));
    // A user edit switches the theme to "custom".
    await expect(page.locator('#config-select')).toHaveValue('custom');
  });

  test('shows a theme picked outside the editor without treating it as a user edit', async ({page}) => {
    await page.selectOption('#config-select', 'dark');
    await page.waitForTimeout(CONFIG_DEBOUNCE_MS + 300);

    const {value} = await getEditorState(page, CONFIG_EDITOR);
    expect(value).toContain('"background"');
    // Had the editor reported the theme as a user edit, the theme would have flipped to "custom".
    await expect(page.locator('#config-select')).toHaveValue('dark');
  });
});
