import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import * as Monaco from 'monaco-editor';
import MonacoEditor from '@monaco-editor/react';
import {EDITOR_FOCUS, LAYOUT, COMPILEDPANE} from '../../../constants/index.js';
import CompiledSpecDisplayHeader from '../compiled-spec-header/index.js';
import {useCallback, useEffect, useRef} from 'react';
import {useAppContext} from '../../../context/app-context.js';
import ResizeObserver from 'rc-resize-observer';

function CompiledSpecDisplay() {
  const {state, setState} = useAppContext();

  const {compiledEditorRef, compiledVegaPaneSize, decorations, editorRef, value} = {
    compiledEditorRef: state.compiledEditorRef,
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    decorations: state.decorations,
    editorRef: state.editorRef,
    value: state.compiledPaneItem === COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  };

  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    setState((s) => ({...s, compiledEditorRef: monacoEditorRef.current}));
  }, [monacoEditorRef, setState]);

  const handleEditorMount = useCallback(
    (monacoEditor: Monaco.editor.IStandaloneCodeEditor) => {
      monacoEditorRef.current = monacoEditor;
      setState((s) => ({...s, compiledEditorRef: monacoEditor}));

      monacoEditor.onDidFocusEditorText(() => {
        compiledEditorRef?.deltaDecorations(decorations, []);
        editorRef?.deltaDecorations(decorations, []);
        setState((s) => ({...s, editorFocus: EDITOR_FOCUS.CompiledEditor}));
      });
    },
    [compiledEditorRef, decorations, editorRef, setState],
  );

  return (
    <div className={'full-height-wrapper'}>
      <CompiledSpecDisplayHeader />
      <ResizeObserver
        onResize={({width, height}) => {
          monacoEditorRef.current?.layout({width, height});
        }}
      >
        <MonacoEditor
          height={compiledVegaPaneSize - LAYOUT.MinPaneSize}
          options={{
            folding: true,
            minimap: {enabled: false},
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            stickyScroll: {
              enabled: false,
            },
          }}
          language="json"
          value={stringify(value)}
          onMount={handleEditorMount}
        />
      </ResizeObserver>
    </div>
  );
}

export default CompiledSpecDisplay;
