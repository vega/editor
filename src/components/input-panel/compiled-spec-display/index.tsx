import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as EditorActions from '../../../actions/editor.js';
import {EDITOR_FOCUS, LAYOUT, COMPILEDPANE} from '../../../constants/index.js';
import CompiledSpecDisplayHeader from '../compiled-spec-header/index.js';
import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks.js';

function CompiledSpecDisplay() {
  const dispatch = useAppDispatch();

  const {compiledEditorRef, compiledVegaPaneSize, decorations, editorRef, value} = useAppSelector((state) => ({
    compiledEditorRef: state.compiledEditorRef,
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    decorations: state.decorations,
    editorRef: state.editorRef,
    value: state.compiledPaneItem === COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  }));

  const monacoEditorRef = useRef(null);

  useEffect(() => {
    dispatch(EditorActions.setCompiledEditorRef(monacoEditorRef.current));
  }, [monacoEditorRef, dispatch]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        monacoEditorRef.current?.layout({width, height});
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={'full-height-wrapper'}>
      <CompiledSpecDisplayHeader />
      <div ref={containerRef} style={{width: '100%', height: '100%'}}>
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
          onMount={(monacoEditor) => {
            monacoEditor.onDidFocusEditorText(() => {
              compiledEditorRef?.deltaDecorations(decorations, []);
              editorRef?.deltaDecorations(decorations, []);
              dispatch(EditorActions.setEditorFocus(EDITOR_FOCUS.CompiledEditor));
            });
            monacoEditorRef.current = monacoEditor;
          }}
        />
      </div>
    </div>
  );
}

export default CompiledSpecDisplay;
