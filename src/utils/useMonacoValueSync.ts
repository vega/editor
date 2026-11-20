import type * as Monaco from 'monaco-editor';
import {MutableRefObject, useCallback, useEffect, useRef} from 'react';

type CodeEditor = Monaco.editor.IStandaloneCodeEditor;

export type MonacoValueSyncOptions = {
  /** The application-state copy of the editor content. */
  value: string;
  /** Receives the editor's current content when a user edit is submitted to application state. */
  onSubmit: (value: string) => void;
  /** Delay before a user edit is submitted. `0` submits synchronously on every change. */
  debounceMs: number;
  /** Called for every user edit, before it is (eventually) submitted. Not called for external changes. */
  onUserEdit?: () => void;
};

export type MonacoValueSync = {
  /** The mounted editor, once `handleMount` has been called. */
  editorRef: MutableRefObject<CodeEditor | null>;
  /** Call from the `<Editor>` `onMount` handler. */
  handleMount: (editor: CodeEditor) => void;
  /** Pass as the `<Editor>` `onChange` handler. */
  handleChange: () => void;
  /** Drops a user edit that has not been submitted yet. The editor content is left alone. */
  cancelPendingSubmit: () => void;
};

/** `source` recorded on the edits this hook applies to the editor. */
export const EXTERNAL_EDIT_SOURCE = 'vega-editor.external';

// Only a couple of submissions are ever in flight; the bound just guards against pathological growth.
const MAX_PENDING_SUBMISSIONS = 32;

/**
 * Keeps a Monaco editor and an application-state string in sync without
 * fighting over the caret.
 *
 * The controlled `value` prop of `@monaco-editor/react` rewrites the whole
 * document, moving the caret to the end, whenever the prop differs from the
 * editor's content. With debounced updates the prop lags behind what the user
 * has typed, so any render inside that window used to clobber the editor
 * (https://github.com/vega/editor/issues/1512).
 *
 * This hook makes the editor the source of truth for the user's own edits:
 *
 * - user edits are submitted from the editor's *current* content, through a
 *   single (optionally debounced) timer that survives re-renders;
 * - a `value` that is merely one of those submissions coming back through
 *   application state is ignored, even if the user has typed more since;
 * - any other `value` is a genuinely external change (example, gist, URL,
 *   config merge, ...) and is written into the editor as an undoable edit that
 *   keeps the caret where it was. It is not reported as a user edit.
 *
 * Render the editor with `defaultValue={value}` rather than `value={value}` so
 * the library's own controlled-value effect stays out of the way.
 */
export function useMonacoValueSync({value, onSubmit, debounceMs, onUserEdit}: MonacoValueSyncOptions): MonacoValueSync {
  const editorRef = useRef<CodeEditor | null>(null);

  // Timer callbacks and the one-shot mount handler must see the latest props.
  const latest = useRef({value, onSubmit, debounceMs, onUserEdit});
  latest.current = {value, onSubmit, debounceMs, onUserEdit};

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Values submitted from the editor that have not come back through `value` yet, oldest first.
  const pendingSubmissionsRef = useRef<string[]>([]);
  const applyingExternalValueRef = useRef(false);

  const cancelPendingSubmit = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitNow = useCallback(() => {
    cancelPendingSubmit();
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const current = editor.getValue();
    const pending = pendingSubmissionsRef.current;
    pending.push(current);
    if (pending.length > MAX_PENDING_SUBMISSIONS) {
      pending.splice(0, pending.length - MAX_PENDING_SUBMISSIONS);
    }
    latest.current.onSubmit(current);
  }, [cancelPendingSubmit]);

  const handleChange = useCallback(() => {
    if (applyingExternalValueRef.current) {
      return;
    }
    latest.current.onUserEdit?.();
    const delay = latest.current.debounceMs;
    if (delay > 0) {
      cancelPendingSubmit();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        submitNow();
      }, delay);
    } else {
      submitNow();
    }
  }, [cancelPendingSubmit, submitNow]);

  const syncEditorToValue = useCallback(
    (editor: CodeEditor, nextValue: string) => {
      const pending = pendingSubmissionsRef.current;
      const index = pending.indexOf(nextValue);
      if (index !== -1) {
        // One of our own submissions coming back. The editor may already be
        // ahead of it, so it must never be written back into the editor.
        pending.splice(0, index + 1);
        return;
      }
      pending.length = 0;
      if (nextValue === editor.getValue()) {
        return;
      }
      // A pending submission would resurrect the text this change replaces.
      cancelPendingSubmit();
      applyExternalValue(editor, nextValue, applyingExternalValueRef);
    },
    [cancelPendingSubmit],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      syncEditorToValue(editor, value);
    }
  }, [value, syncEditorToValue]);

  // Once a render shows the editor and `value` in agreement nothing is in
  // flight any more, so forget submissions whose round trip never produced a
  // `value` change (e.g. an edit that was reverted before it was submitted).
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && pendingSubmissionsRef.current.length > 0 && latest.current.value === editor.getValue()) {
      pendingSubmissionsRef.current.length = 0;
    }
  });

  useEffect(() => cancelPendingSubmit, [cancelPendingSubmit]);

  const handleMount = useCallback(
    (editor: CodeEditor) => {
      editorRef.current = editor;
      // Monaco mounts asynchronously; `value` may have moved on since the model was created.
      syncEditorToValue(editor, latest.current.value);
    },
    [syncEditorToValue],
  );

  return {editorRef, handleMount, handleChange, cancelPendingSubmit};
}

function applyExternalValue(editor: CodeEditor, nextValue: string, guard: MutableRefObject<boolean>) {
  const model = editor.getModel();
  if (!model) {
    return;
  }
  // Monaco clamps the restored selection to the new document, so a caret that
  // no longer fits ends up at the nearest valid position rather than at the end.
  const selection = editor.getSelection();
  guard.current = true;
  try {
    editor.pushUndoStop();
    editor.executeEdits(
      EXTERNAL_EDIT_SOURCE,
      [{range: model.getFullModelRange(), text: nextValue, forceMoveMarkers: true}],
      selection ? [selection] : undefined,
    );
    editor.pushUndoStop();
  } finally {
    guard.current = false;
  }
}
