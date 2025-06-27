import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import MonacoEditor from '@monaco-editor/react';
import {useNavigate} from 'react-router';
import {debounce} from 'vega';
import {LAYOUT, Mode, SIDEPANE} from '../../constants/index.js';
import {useAppSelector} from '../../hooks.js';
import './config-editor.css';

type Props = {
  extractConfig: () => void;
  mergeConfigSpec: () => void;
  setConfig: (config: string) => void;
  setConfigEditorString: (configString: string) => void;
  setEditorReference: (reference: any) => void;
  setThemeName: (theme: string) => void;
};

const ConfigEditor: React.FC<Props> = (props) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const navigate = useNavigate();

  const {
    configEditorString,
    manualParse,
    decorations,
    sidePaneItem,
    editorRef: reduxEditorRef,
  } = useAppSelector((state) => ({
    configEditorString: state.configEditorString,
    manualParse: state.manualParse,
    decorations: state.decorations,
    sidePaneItem: state.sidePaneItem,
    editorRef: state.editorRef,
  }));

  const handleEditorChange = useCallback(
    (spec: string) => {
      const newSpec = spec === '' ? '{}' : spec;
      if (newSpec !== configEditorString) {
        props.setConfigEditorString(newSpec);
        props.setThemeName('custom');

        if (!manualParse) {
          props.setConfig(newSpec);
        }
      }
    },
    [props.setConfigEditorString, props.setThemeName, manualParse, props.setConfig, configEditorString],
  );

  const handleMergeConfig = useCallback(() => {
    const confirmation = confirm('The spec will be formatted on merge.');
    if (!confirmation) {
      return;
    }
    navigate('/edited');
    props.mergeConfigSpec();
  }, [navigate, props.mergeConfigSpec]);

  const handleExtractConfig = useCallback(() => {
    const confirmation = confirm('The spec and config will be formatted.');
    if (!confirmation) {
      return;
    }
    props.extractConfig();
  }, [props.extractConfig]);

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      editor.onDidFocusEditorText(() => {
        editor.deltaDecorations(decorations, []);
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 0,
        id: 'MERGE_CONFIG',
        label: 'Merge Config Into Spec',
        run: handleMergeConfig,
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 1,
        id: 'EXTRACT_CONFIG',
        label: 'Extract Config From Spec',
        run: handleExtractConfig,
      });

      editorRef.current = editor;

      if (sidePaneItem === SIDEPANE.Config) {
        editor.focus();
        editor.layout();
      }
    },
    [decorations, sidePaneItem, handleMergeConfig, handleExtractConfig],
  );

  useEffect(() => {
    if (editorRef.current && editorRef.current !== reduxEditorRef && sidePaneItem === SIDEPANE.Config) {
      props.setEditorReference(editorRef.current);
    }
  }, [editorRef.current, reduxEditorRef, sidePaneItem, props.setEditorReference]);

  useEffect(() => {
    if (sidePaneItem === SIDEPANE.Config && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.layout();
    }
  }, [sidePaneItem]);

  const debouncedHandleEditorChange = useCallback(debounce(700, handleEditorChange), [handleEditorChange]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        editorRef.current?.layout({width, height});
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} style={{width: '100%', height: '100%'}}>
      <MonacoEditor
        defaultLanguage="json"
        options={{
          cursorBlinking: 'smooth',
          folding: true,
          lineNumbersMinChars: 4,
          minimap: {enabled: false},
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          quickSuggestions: true,
          stickyScroll: {
            enabled: false,
          },
        }}
        onChange={debouncedHandleEditorChange}
        defaultValue={configEditorString}
        onMount={handleEditorMount}
      />
    </div>
  );
};

export default ConfigEditor;
