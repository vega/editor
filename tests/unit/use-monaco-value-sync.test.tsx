import React from 'react';
import {act, render} from '@testing-library/react';
import type * as Monaco from 'monaco-editor';
import {EXTERNAL_EDIT_SOURCE, useMonacoValueSync} from '../../src/utils/useMonacoValueSync';
import {FakeEditor, FakeMonacoEditor, getMountedEditors} from '../helpers/fake-monaco';

type HostProps = {
  value: string;
  /** Content the Monaco model is created with, when it should differ from `value`. */
  modelValue?: string;
  debounceMs: number;
  onSubmit: (value: string) => void;
  onUserEdit?: () => void;
};

function Host({value, modelValue, debounceMs, onSubmit, onUserEdit}: HostProps) {
  const {handleMount, handleChange} = useMonacoValueSync({value, debounceMs, onSubmit, onUserEdit});
  const onMount = handleMount as unknown as (editor: FakeMonacoEditor) => void;
  return <FakeEditor defaultValue={modelValue ?? value} onMount={onMount} onChange={handleChange} />;
}

function renderHost(initial: HostProps) {
  let current = initial;
  const utils = render(<Host {...current} />);
  const editor = getMountedEditors()[0];
  const rerender = (next: Partial<HostProps>) => {
    current = {...current, ...next};
    utils.rerender(<Host {...current} />);
  };
  return {editor, rerender, unmount: utils.unmount};
}

describe('useMonacoValueSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submits the current content once after the debounce, across re-renders with new callbacks', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {editor, rerender} = renderHost({value: '', debounceMs: 1000, onSubmit: first});

    act(() => editor.type('a'));
    rerender({onSubmit: second});
    act(() => vi.advanceTimersByTime(100));
    act(() => editor.type('b'));

    act(() => vi.advanceTimersByTime(999));
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith('ab');
  });

  it('submits synchronously when debounceMs is 0', () => {
    const onSubmit = vi.fn();
    const {editor} = renderHost({value: '', debounceMs: 0, onSubmit});

    act(() => editor.type('a'));
    expect(onSubmit).toHaveBeenLastCalledWith('a');
    act(() => editor.type('b'));
    expect(onSubmit).toHaveBeenLastCalledWith('ab');
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('switches from debounced to immediate submission without firing the old timer', () => {
    const onSubmit = vi.fn();
    const {editor, rerender} = renderHost({value: '', debounceMs: 1000, onSubmit});

    act(() => editor.type('a'));
    rerender({debounceMs: 0});
    act(() => editor.type('b'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('ab');

    act(() => vi.advanceTimersByTime(1000));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('ignores its own submissions coming back through value, even stale ones', () => {
    const {editor, rerender} = renderHost({value: '', debounceMs: 0, onSubmit: vi.fn()});
    act(() => editor.type('a'));
    act(() => editor.type('b'));

    // React may render the first submission only after the second keystroke was applied.
    rerender({value: 'a'});
    expect(editor.getValue()).toBe('ab');
    rerender({value: 'ab'});
    expect(editor.getValue()).toBe('ab');
    expect(editor.getCaretOffset()).toBe(2);
    expect(editor.programmaticEdits).toEqual([]);

    rerender({value: 'zzz'});
    expect(editor.getValue()).toBe('zzz');
  });

  it('ignores a debounced submission coming back after more typing', () => {
    const onSubmit = vi.fn();
    const {editor, rerender} = renderHost({value: '', debounceMs: 1000, onSubmit});

    act(() => editor.type('a'));
    act(() => vi.advanceTimersByTime(1000));
    expect(onSubmit).toHaveBeenCalledWith('a');

    act(() => editor.type('b'));
    rerender({value: 'a'});
    expect(editor.getValue()).toBe('ab');
    expect(editor.getCaretOffset()).toBe(2);
    expect(editor.programmaticEdits).toEqual([]);

    act(() => vi.advanceTimersByTime(1000));
    expect(onSubmit).toHaveBeenLastCalledWith('ab');
  });

  it('forgets submissions once the editor and value agree, so an equal external value is applied later', () => {
    const {editor, rerender} = renderHost({value: '', debounceMs: 0, onSubmit: vi.fn()});

    // An edit that is reverted again: both submissions leave the app state at ''.
    act(() => editor.type('a'));
    act(() => editor.setValue(''));
    rerender({});
    expect(editor.getValue()).toBe('');

    rerender({value: 'a'});
    expect(editor.getValue()).toBe('a');
  });

  it('writes external values into the editor, keeping the caret and the undo history', () => {
    const onSubmit = vi.fn();
    const onUserEdit = vi.fn();
    const {editor, rerender} = renderHost({value: 'hello world', debounceMs: 1000, onSubmit, onUserEdit});
    editor.setCaretOffset(5);

    rerender({value: 'goodbye world'});
    expect(editor.getValue()).toBe('goodbye world');
    expect(editor.getCaretOffset()).toBe(5);
    expect(editor.programmaticEdits).toEqual([{source: EXTERNAL_EDIT_SOURCE, text: 'goodbye world'}]);
    expect(editor.undoStops).toBe(2);
    expect(onUserEdit).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1000));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clamps the restored caret to the new document', () => {
    const {editor, rerender} = renderHost({value: 'abcdef', debounceMs: 0, onSubmit: vi.fn()});
    editor.setCaretOffset(6);
    rerender({value: 'ab'});
    expect(editor.getCaretOffset()).toBe(2);
  });

  it('drops a pending submission when an external value arrives', () => {
    const onSubmit = vi.fn();
    const {editor, rerender} = renderHost({value: '', debounceMs: 1000, onSubmit});

    act(() => editor.type('typed'));
    rerender({value: 'external'});
    expect(editor.getValue()).toBe('external');

    act(() => vi.advanceTimersByTime(1000));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('cancels a pending submission on unmount', () => {
    const onSubmit = vi.fn();
    const {editor, unmount} = renderHost({value: '', debounceMs: 1000, onSubmit});

    act(() => editor.type('a'));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('brings a model created from a stale default up to date on mount', () => {
    const {editor} = renderHost({value: 'current', modelValue: 'stale', debounceMs: 0, onSubmit: vi.fn()});
    expect(editor.getValue()).toBe('current');
  });

  it('reports user edits, and only user edits', () => {
    const onUserEdit = vi.fn();
    const {editor, rerender} = renderHost({value: '', debounceMs: 1000, onSubmit: vi.fn(), onUserEdit});

    act(() => editor.type('a'));
    act(() => editor.type('b'));
    expect(onUserEdit).toHaveBeenCalledTimes(2);

    rerender({value: 'external'});
    expect(onUserEdit).toHaveBeenCalledTimes(2);
  });

  it('exposes the mounted editor through editorRef', () => {
    let exposed: Monaco.editor.IStandaloneCodeEditor | null = null;
    function RefHost() {
      const {editorRef, handleMount, handleChange} = useMonacoValueSync({value: 'x', debounceMs: 0, onSubmit: vi.fn()});
      exposed = editorRef.current;
      const onMount = handleMount as unknown as (editor: FakeMonacoEditor) => void;
      return <FakeEditor defaultValue="x" onMount={onMount} onChange={handleChange} />;
    }
    const utils = render(<RefHost />);
    utils.rerender(<RefHost />);
    expect(exposed).toBe(getMountedEditors()[0]);
  });
});
