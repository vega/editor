import React, {useEffect, useRef} from 'react';

/**
 * A small in-memory stand-in for Monaco's `IStandaloneCodeEditor`, plus a React
 * component that mimics the `<Editor>` contract of `@monaco-editor/react` v4.
 * The real Monaco cannot load under jsdom, so the editor components are
 * exercised against this double instead.
 */

export type FakePosition = {lineNumber: number; column: number};

type FakeRange = {startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number};

type FakeSelection = FakeRange & {
  selectionStartLineNumber: number;
  selectionStartColumn: number;
  positionLineNumber: number;
  positionColumn: number;
};

type ContentChangeEvent = {isFlush: boolean};

type EditOperation = {range: FakeRange; text: string | null; forceMoveMarkers?: boolean};

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export class FakeMonacoEditor {
  private value: string;
  private caret = 0;
  private readonly contentListeners = new Set<(e: ContentChangeEvent) => void>();
  private readonly focusListeners = new Set<() => void>();

  /** Every edit applied through the API (`executeEdits`/`setValue`), i.e. not typed by the "user". */
  public readonly programmaticEdits: {source: string; text: string}[] = [];
  public readonly actions: {id: string; run: () => void}[] = [];
  public undoStops = 0;
  public focused = false;

  constructor(initialValue: string) {
    this.value = initialValue;
  }

  // ---- helpers for tests ---------------------------------------------------

  /** Simulates the user typing `text` at the caret. */
  type(text: string) {
    this.value = this.value.slice(0, this.caret) + text + this.value.slice(this.caret);
    this.caret += text.length;
    this.emitContentChange(false);
  }

  getCaretOffset() {
    return this.caret;
  }

  setCaretOffset(offset: number) {
    this.caret = clamp(offset, 0, this.value.length);
  }

  // ---- IStandaloneCodeEditor subset ---------------------------------------

  getValue() {
    return this.value;
  }

  setValue(newValue: string) {
    this.value = newValue;
    this.caret = 0;
    this.programmaticEdits.push({source: 'setValue', text: newValue});
    this.emitContentChange(true);
  }

  getModel() {
    return {
      getValue: () => this.value,
      getFullModelRange: (): FakeRange => this.fullRange(),
      getOptions: () => ({}),
      uri: {path: '/fake-model', toString: () => 'inmemory://fake-model'},
    };
  }

  executeEdits(source: string | null | undefined, edits: EditOperation[], endCursorState?: unknown) {
    for (const edit of edits) {
      const start = this.offsetAt({lineNumber: edit.range.startLineNumber, column: edit.range.startColumn});
      const end = this.offsetAt({lineNumber: edit.range.endLineNumber, column: edit.range.endColumn});
      const text = edit.text ?? '';
      this.value = this.value.slice(0, start) + text + this.value.slice(end);
      // Like Monaco with `forceMoveMarkers`, a caret inside the replaced range lands after the inserted text.
      this.caret = start + text.length;
      this.programmaticEdits.push({source: source ?? '', text});
    }
    if (Array.isArray(endCursorState) && endCursorState.length > 0) {
      const selection = endCursorState[0] as FakeSelection;
      this.setPosition({lineNumber: selection.positionLineNumber, column: selection.positionColumn});
    }
    this.emitContentChange(false);
    return true;
  }

  pushUndoStop() {
    this.undoStops++;
    return true;
  }

  getPosition(): FakePosition {
    return this.positionAt(this.caret);
  }

  setPosition(position: FakePosition) {
    this.caret = this.offsetAt(position);
  }

  getSelection(): FakeSelection {
    const {lineNumber, column} = this.getPosition();
    return {
      startLineNumber: lineNumber,
      startColumn: column,
      endLineNumber: lineNumber,
      endColumn: column,
      selectionStartLineNumber: lineNumber,
      selectionStartColumn: column,
      positionLineNumber: lineNumber,
      positionColumn: column,
    };
  }

  setSelection(selection: FakeSelection) {
    this.setPosition({lineNumber: selection.positionLineNumber, column: selection.positionColumn});
  }

  focus() {
    this.focused = true;
    for (const listener of [...this.focusListeners]) listener();
  }

  hasTextFocus() {
    return this.focused;
  }

  layout() {}
  updateOptions() {}
  revealLine() {}
  revealPosition() {}
  revealRange() {}
  revealRangeInCenterIfOutsideViewport() {}
  dispose() {}

  getOption() {
    return false;
  }

  deltaDecorations(_previous: string[], next: unknown[]) {
    return next.map((_, i) => `decoration-${i}`);
  }

  createDecorationsCollection() {
    return {clear() {}, set() {}};
  }

  addAction(action: {id: string; run: () => void}) {
    this.actions.push(action);
    return {dispose() {}};
  }

  onDidChangeModelContent(listener: (e: ContentChangeEvent) => void) {
    this.contentListeners.add(listener);
    return {dispose: () => this.contentListeners.delete(listener)};
  }

  onDidFocusEditorText(listener: () => void) {
    this.focusListeners.add(listener);
    return {dispose: () => this.focusListeners.delete(listener)};
  }

  // ---- internals -----------------------------------------------------------

  private emitContentChange(isFlush: boolean) {
    for (const listener of [...this.contentListeners]) listener({isFlush});
  }

  private fullRange(): FakeRange {
    const end = this.positionAt(this.value.length);
    return {startLineNumber: 1, startColumn: 1, endLineNumber: end.lineNumber, endColumn: end.column};
  }

  private positionAt(offset: number): FakePosition {
    const lines = this.value.slice(0, clamp(offset, 0, this.value.length)).split('\n');
    return {lineNumber: lines.length, column: lines[lines.length - 1].length + 1};
  }

  private offsetAt(position: FakePosition): number {
    const lines = this.value.split('\n');
    const lineNumber = clamp(position.lineNumber, 1, lines.length);
    let offset = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      offset += lines[i].length + 1;
    }
    return offset + clamp(position.column - 1, 0, lines[lineNumber - 1].length);
  }
}

const mountedEditors: FakeMonacoEditor[] = [];

/** The fake editors currently mounted, in mount order. */
export function getMountedEditors(): FakeMonacoEditor[] {
  return [...mountedEditors];
}

export const fakeMonacoNamespace = {editor: {EditorOption: {readOnly: 'readOnly'}}};

type FakeEditorProps = {
  value?: string;
  defaultValue?: string;
  onMount?: (editor: FakeMonacoEditor, monaco: typeof fakeMonacoNamespace) => void;
  onChange?: (value: string, event: ContentChangeEvent) => void;
  [prop: string]: unknown;
};

/**
 * Mirrors `@monaco-editor/react`'s `<Editor>`: the `onMount` from the first
 * render is called once with the editor, `onChange` always receives the full
 * content, and - the behaviour behind vega/editor#1512 - a controlled `value`
 * that differs from the editor's content is written back with a whole-document
 * `executeEdits`, which moves the caret to the end of the document.
 */
export function FakeEditor({value, defaultValue, onMount, onChange}: FakeEditorProps) {
  const editorRef = useRef<FakeMonacoEditor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suppressChangeRef = useRef(false);
  const skipFirstValueEffect = useRef(true);

  useEffect(() => {
    const editor = new FakeMonacoEditor(value ?? defaultValue ?? '');
    editorRef.current = editor;
    mountedEditors.push(editor);
    onMount?.(editor, fakeMonacoNamespace);
    const subscription = editor.onDidChangeModelContent((event) => {
      if (!suppressChangeRef.current) {
        onChangeRef.current?.(editor.getValue(), event);
      }
    });
    return () => {
      subscription.dispose();
      mountedEditors.splice(mountedEditors.indexOf(editor), 1);
    };
    // The real component also only ever uses the props from its first render here.
  }, []);

  useEffect(() => {
    if (skipFirstValueEffect.current) {
      skipFirstValueEffect.current = false;
      return;
    }
    const editor = editorRef.current;
    if (!editor || value === undefined || value === editor.getValue()) {
      return;
    }
    suppressChangeRef.current = true;
    editor.executeEdits('', [{range: editor.getModel().getFullModelRange(), text: value, forceMoveMarkers: true}]);
    editor.pushUndoStop();
    suppressChangeRef.current = false;
  }, [value]);

  return <div data-testid="fake-monaco-editor" />;
}
