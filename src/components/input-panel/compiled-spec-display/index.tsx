import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as EditorActions from '../../../actions/editor.js';
import {EDITOR_FOCUS, LAYOUT, COMPILEDPANE} from '../../../constants/index.js';
import CompiledSpecDisplayHeader from '../compiled-spec-header/index.js';
import {useEffect, useRef, useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks.js';

function CompiledSpecDisplay() {
  const dispatch = useAppDispatch();

  const compiledEditorRef = useAppSelector((state) => state.compiledEditorRef);
  const compiledVegaPaneSize = useAppSelector((state) => state.compiledVegaPaneSize);
  const decorations = useAppSelector((state) => state.decorations);
  const editorRef = useAppSelector((state) => state.editorRef);
  const value = useAppSelector((state) =>
    state.compiledPaneItem === COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  );

  const setCompiledEditorReference = useCallback(
    (ref) => {
      dispatch(EditorActions.setCompiledEditorRef(ref));
    },
    [dispatch],
  );

  const setEditorFocus = useCallback(
    (focus) => {
      dispatch(EditorActions.setEditorFocus(focus));
    },
    [dispatch],
  );

  const monacoEditorRef = useRef(null);

  //store editor reference in redux store
  useEffect(() => {
    setCompiledEditorReference(monacoEditorRef.current);
  }, [monacoEditorRef, setCompiledEditorReference]);

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
              compiledEditorRef && compiledEditorRef.deltaDecorations(decorations, []);
              editorRef && editorRef.deltaDecorations(decorations, []);
              setEditorFocus(EDITOR_FOCUS.CompiledEditor);
            });
            monacoEditorRef.current = monacoEditor;
          }}
        />
      </div>
    </div>
  );
}

export default CompiledSpecDisplay;
