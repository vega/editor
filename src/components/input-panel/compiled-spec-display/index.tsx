import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from '@monaco-editor/react';
import {EDITOR_FOCUS, LAYOUT, COMPILEDPANE} from '../../../constants/index.js';
import CompiledSpecDisplayHeader from '../compiled-spec-header/index.js';
import {useCallback, useEffect, useRef} from 'react';
import {useAppContext} from '../../../context/app-context.js';

function CompiledSpecDisplay() {
  const {state, setState} = useAppContext();

  const {compiledEditorRef, compiledVegaPaneSize, decorations, editorRef, value} = {
    compiledEditorRef: state.compiledEditorRef,
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    decorations: state.decorations,
    editorRef: state.editorRef,
    value: state.compiledPaneItem === COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  };

  const monacoEditorRef = useRef(null);

  useEffect(() => {
    setState((s) => ({...s, compiledEditorRef: monacoEditorRef.current}));
  }, [monacoEditorRef, setState]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        try {
          monacoEditorRef.current?.layout({width, height});
        } catch (error) {
          console.warn('Failed to layout editor:', error);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleEditorMount = useCallback(
    (monacoEditor) => {
      monacoEditorRef.current = monacoEditor;
      // Set the compiled editor reference in state
      setState((s) => ({...s, compiledEditorRef: monacoEditor}));

      monacoEditor.onDidFocusEditorText(() => {
        try {
          compiledEditorRef?.deltaDecorations(decorations, []);
          editorRef?.deltaDecorations(decorations, []);
          setState((s) => ({...s, editorFocus: EDITOR_FOCUS.CompiledEditor}));
        } catch (error) {
          console.warn('Failed to handle:', error);
        }
      });
    },
    [compiledEditorRef, decorations, editorRef, setState],
  );

  return (
    <div className={'full-height-wrapper'}>
      <CompiledSpecDisplayHeader />
      <div ref={containerRef} style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
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
      </div>
    </div>
  );
}

export default CompiledSpecDisplay;
