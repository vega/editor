import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import Editor from '@monaco-editor/react';
import {useNavigate} from 'react-router';
import {debounce} from 'vega';
import {SIDEPANE} from '../../constants/index.js';
import {useAppContext} from '../../context/app-context.js';
import './config-editor.css';
import ResizeObserver from 'rc-resize-observer';
import {parse as parseJSONC} from 'jsonc-parser';

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
  const [currentDecorationIds, setCurrentDecorationIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const {state} = useAppContext();

  const {configEditorString, manualParse, decorations, sidePaneItem} = state;

  const {setState} = useAppContext();
  React.useEffect(() => {
    try {
      const parsed = configEditorString ? parseJSONC(configEditorString) : {};
      setState((s) => ({...s, config: parsed || {}}));
    } catch {
      setState((s) => ({...s, config: {}}));
    }
  }, [configEditorString, setState]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const spec = value === undefined ? '{}' : value;
      props.setConfigEditorString(spec);
      props.setThemeName('custom');
      if (manualParse) {
        return;
      }
      props.setConfig(spec);
    },
    [manualParse, props],
  );

  const debouncedHandleEditorChange = useCallback(debounce(700, handleEditorChange), [handleEditorChange]);

  const handleMergeConfig = useCallback(() => {
    if (confirm('The spec will be formatted on merge.')) {
      navigate('/edited');
      props.mergeConfigSpec();
    }
  }, [navigate, props]);

  const handleExtractConfig = useCallback(() => {
    if (confirm('The spec and config will be formatted.')) {
      props.extractConfig();
    }
  }, [props]);

  const handleEditorMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      props.setEditorReference(editor);

      editor.onDidFocusEditorText(() => {
        props.setEditorReference(editor);
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
    },
    [handleExtractConfig, handleMergeConfig, props],
  );

  useEffect(() => {
    if (sidePaneItem === SIDEPANE.Config && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.layout();
    }
  }, [sidePaneItem]);

  useEffect(() => {
    if (editorRef.current) {
      const newDecorationIds = editorRef.current.deltaDecorations(currentDecorationIds, decorations);
      setCurrentDecorationIds(newDecorationIds);
    }
  }, [decorations]);

  return (
    <ResizeObserver
      onResize={({width, height}) => {
        editorRef.current?.layout({width, height});
      }}
    >
      <Editor
        language="json"
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
        value={configEditorString}
        onChange={debouncedHandleEditorChange}
        onMount={handleEditorMount}
      />
    </ResizeObserver>
  );
};

export default ConfigEditor;
