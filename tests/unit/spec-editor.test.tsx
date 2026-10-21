// Regression tests for https://github.com/vega/editor/issues/1512: while typing
// in auto-run mode the caret jumped to the end of the spec and keystrokes were
// lost, because debounced copies of the editor content were written back into
// the (controlled) Monaco editor.

import React, {Dispatch, SetStateAction} from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {MemoryRouter, NavigateFunction, useLocation, useNavigate} from 'react-router-dom';
import {VEGA_LITE_START_SPEC, VEGA_START_SPEC} from '../../src/constants/consts';
import type {State} from '../../src/constants/default-state';
import type {FakeMonacoEditor} from '../helpers/fake-monaco';

vi.mock('@monaco-editor/react', async () => {
  const {FakeEditor} = await import('../helpers/fake-monaco');
  return {
    default: FakeEditor,
    Editor: FakeEditor,
    loader: {init: () => Promise.resolve(null), config: () => undefined},
  };
});

// The shared setup file has already loaded the app with the real Monaco
// wrapper, so the mock only takes effect on a module graph loaded after it.
let AppShell: typeof import('../../src/components/app-shell').default;
let AppContextProvider: typeof import('../../src/context/app-context').AppContextProvider;
let useAppContext: typeof import('../../src/context/app-context').useAppContext;
let getMountedEditors: typeof import('../helpers/fake-monaco').getMountedEditors;

beforeAll(async () => {
  vi.resetModules();
  ({getMountedEditors} = await import('../helpers/fake-monaco'));
  ({AppContextProvider, useAppContext} = await import('../../src/context/app-context'));
  ({default: AppShell} = await import('../../src/components/app-shell'));
});

const SPEC_DEBOUNCE_MS = 1200;
const CONFIG_DEBOUNCE_MS = 700;

let probe: {state: State; setState: Dispatch<SetStateAction<State>>; navigate: NavigateFunction; pathname: string};

// Exposes the live app state and router to the tests.
function Probe() {
  const {state, setState} = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  probe = {state, setState, navigate, pathname: location.pathname};
  return null;
}

function renderEditorApp(initialPath = '/') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppContextProvider>
        <Probe />
        <AppShell />
      </AppContextProvider>
    </MemoryRouter>,
  );
  // InputPanel mounts the spec editor before the config editor.
  const [specEditor, configEditor] = getMountedEditors();
  expect(specEditor.getValue()).toBe(VEGA_LITE_START_SPEC);
  expect(configEditor.getValue()).toBe('{}');
  return {specEditor, configEditor};
}

const EXAMPLE_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {"values": [{"a": 1}]},
  "mark": "point",
  "encoding": {"x": {"field": "a", "type": "quantitative"}}
}`;

/** Opens an example route; the app fetches the spec and puts it into state. */
async function loadExample(spec: string) {
  vi.mocked(fetch).mockResolvedValueOnce({ok: true, status: 200, text: () => Promise.resolve(spec)} as Response);
  await act(async () => {
    probe.navigate('/examples/vega-lite/bar');
  });
}

/** Puts the caret right after the opening brace and types the start of a new property. */
function startTypingProperty(editor: FakeMonacoEditor, text: string) {
  const insertAt = editor.getValue().indexOf('{') + 1;
  editor.setCaretOffset(insertAt);
  act(() => editor.type(text));
  return insertAt;
}

describe('Spec editor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the caret and keystrokes when a debounced update lands after further typing', () => {
    const {specEditor} = renderEditorApp();
    const typed = '\n  "description": "O';
    const insertAt = startTypingProperty(specEditor, typed);

    // The auto-run timer fires, and the next keystroke arrives before React has
    // re-rendered with the submitted spec.
    act(() => {
      vi.advanceTimersByTime(SPEC_DEBOUNCE_MS);
      specEditor.type('b');
    });
    expect(specEditor.getValue()).toContain('"description": "Ob');
    expect(specEditor.getCaretOffset()).toBe(insertAt + typed.length + 1);

    act(() => vi.advanceTimersByTime(SPEC_DEBOUNCE_MS));
    expect(specEditor.getCaretOffset()).toBe(insertAt + typed.length + 1);
    expect(probe.state.editorString).toBe(specEditor.getValue());
    expect(specEditor.programmaticEdits).toEqual([]);
  });

  it('keeps a single pending update when the app re-renders between keystrokes', () => {
    const {specEditor} = renderEditorApp();
    const typed = '\n  "description": "O';
    const insertAt = startTypingProperty(specEditor, typed);
    act(() => vi.advanceTimersByTime(100));

    // Any app state change re-renders the editor component; here the settings pane is opened.
    act(() => {
      fireEvent.click(screen.getByText('Settings'));
    });
    act(() => specEditor.type('b'));

    // The debounce started by the first keystroke elapses first. It used to fire
    // with the content from before the re-render.
    act(() => vi.advanceTimersByTime(SPEC_DEBOUNCE_MS - 100));
    expect(specEditor.getValue()).toContain('"description": "Ob');
    expect(specEditor.getCaretOffset()).toBe(insertAt + typed.length + 1);

    act(() => vi.advanceTimersByTime(SPEC_DEBOUNCE_MS));
    expect(specEditor.getCaretOffset()).toBe(insertAt + typed.length + 1);
    expect(probe.state.editorString).toBe(specEditor.getValue());
    expect(probe.state.editorString).toContain('"description": "Ob');
    expect(specEditor.programmaticEdits).toEqual([]);
  });

  it('submits the typed spec to the app after the debounce and marks the spec as edited', () => {
    const {specEditor} = renderEditorApp();
    startTypingProperty(specEditor, '\n  "description": "typed",');
    expect(probe.pathname).toBe('/edited');
    expect(probe.state.editorString).toBe(VEGA_LITE_START_SPEC);

    act(() => vi.advanceTimersByTime(SPEC_DEBOUNCE_MS));
    expect(probe.state.editorString).toBe(specEditor.getValue());
    expect(probe.state.editorString).toContain('"description": "typed"');
  });

  it('updates the app on every keystroke in manual mode', () => {
    localStorage.setItem('state', JSON.stringify({manualParse: true}));
    const {specEditor} = renderEditorApp();
    const typed = '\n  "description": "manual",';
    const insertAt = startTypingProperty(specEditor, typed);

    expect(probe.state.editorString).toBe(specEditor.getValue());
    expect(probe.state.editorString).toContain('"description": "manual"');
    expect(specEditor.getCaretOffset()).toBe(insertAt + typed.length);
    expect(specEditor.programmaticEdits).toEqual([]);
  });

  it('shows a spec loaded from outside the editor without reporting a user edit', async () => {
    const {specEditor} = renderEditorApp();
    specEditor.setCaretOffset(1);

    // Examples, gists and share URLs all arrive through the same state update.
    await loadExample(EXAMPLE_SPEC);
    expect(specEditor.getValue()).toBe(EXAMPLE_SPEC);
    expect(probe.state.editorString).toBe(EXAMPLE_SPEC);
    expect(probe.pathname).toBe('/examples/vega-lite/bar');
    expect(specEditor.programmaticEdits).toHaveLength(1);
    // The caret is kept where it was rather than pushed to the end of the document.
    expect(specEditor.getCaretOffset()).toBe(1);
  });

  it('discards unsent typing when a spec is loaded from outside the editor', async () => {
    const {specEditor} = renderEditorApp();
    startTypingProperty(specEditor, '\n  "description": "unsent",');

    await loadExample(EXAMPLE_SPEC);
    expect(specEditor.getValue()).toBe(EXAMPLE_SPEC);

    act(() => vi.advanceTimersByTime(SPEC_DEBOUNCE_MS));
    expect(specEditor.getValue()).toBe(EXAMPLE_SPEC);
    expect(probe.state.editorString).toBe(EXAMPLE_SPEC);
  });

  it('discards unsent typing when the mode is switched', () => {
    const {specEditor} = renderEditorApp();
    startTypingProperty(specEditor, '\n  "description": "unsent",');

    // Switching modes re-mounts the editor pane with an empty spec for the new mode.
    act(() => probe.navigate('/custom/vega'));
    expect(probe.state.editorString).toBe(VEGA_START_SPEC);
    const [remountedEditor] = getMountedEditors();
    expect(remountedEditor).not.toBe(specEditor);
    expect(remountedEditor.getValue()).toBe(VEGA_START_SPEC);

    act(() => vi.advanceTimersByTime(SPEC_DEBOUNCE_MS));
    expect(probe.state.editorString).toBe(VEGA_START_SPEC);
    expect(remountedEditor.getValue()).toBe(VEGA_START_SPEC);
  });
});

describe('Config editor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the caret and keystrokes when the app re-renders between keystrokes', () => {
    const {configEditor} = renderEditorApp();
    configEditor.setCaretOffset(1);
    act(() => configEditor.type('"background": "r'));
    act(() => vi.advanceTimersByTime(100));

    act(() => {
      fireEvent.click(screen.getByText('Settings'));
    });
    act(() => configEditor.type('ed"'));

    act(() => vi.advanceTimersByTime(CONFIG_DEBOUNCE_MS - 100));
    expect(configEditor.getValue()).toBe('{"background": "red"}');
    expect(configEditor.getCaretOffset()).toBe('{"background": "red"'.length);

    act(() => vi.advanceTimersByTime(CONFIG_DEBOUNCE_MS));
    expect(configEditor.getValue()).toBe('{"background": "red"}');
    expect(configEditor.getCaretOffset()).toBe('{"background": "red"'.length);
    expect(probe.state.configEditorString).toBe('{"background": "red"}');
    expect(probe.state.config).toEqual({background: 'red'});
    expect(probe.state.themeName).toBe('custom');
    expect(configEditor.programmaticEdits).toEqual([]);
  });

  it('shows a config set outside the editor, such as a theme, without reporting a user edit', () => {
    const {configEditor} = renderEditorApp();
    const themeConfig = '{\n  "background": "#333"\n}';

    act(() => probe.setState((s) => ({...s, configEditorString: themeConfig, themeName: 'dark'})));
    expect(configEditor.getValue()).toBe(themeConfig);
    expect(configEditor.programmaticEdits).toHaveLength(1);

    act(() => vi.advanceTimersByTime(CONFIG_DEBOUNCE_MS));
    expect(probe.state.themeName).toBe('dark');
    expect(probe.state.configEditorString).toBe(themeConfig);
  });
});
