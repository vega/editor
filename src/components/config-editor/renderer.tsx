import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import Editor from '@monaco-editor/react';
import {useNavigate} from 'react-router-dom';
import {SIDEPANE} from '../../constants/index.js';
import {useAppContext} from '../../context/app-context.js';
import './config-editor.css';
import ResizeObserver from 'rc-resize-observer';
import {parse as parseJSONC} from 'jsonc-parser';
import {useMonacoValueSync} from '../../utils/useMonacoValueSync.js';

/** Quiet time after the last keystroke before a config edit is sent to the app. */
export const CONFIG_UPDATE_DEBOUNCE_MS = 700;

type Props = {
  extractConfig: () => void;
  mergeConfigSpec: () => void;
  setConfig: (config: string) => void;
  setConfigEditorString: (configString: string) => void;
  setEditorReference: (reference: any) => void;
  setThemeName: (theme: string) => void;
};

const ConfigEditor: React.FC<Props> = (props) => {
  const [currentDecorationIds, setCurrentDecorationIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const {state, setState} = useAppContext();

  const {configEditorString, manualParse, decorations, sidePaneItem} = state;

  React.useEffect(() => {
    try {
      const parsed = configEditorString ? parseJSONC(configEditorString) : {};
      setState((s) => ({...s, config: parsed || {}}));
    } catch {
      setState((s) => ({...s, config: {}}));
    }
  }, [configEditorString, setState]);

  const submitUserEdit = useCallback(
    (config: string) => {
      props.setConfigEditorString(config);
      props.setThemeName('custom');
      if (!manualParse) {
        props.setConfig(config);
      }
    },
    [manualParse, props],
  );

  // The editor owns the user's edits; `configEditorString` is only written into
  // it when it changed elsewhere (themes, config extraction, ...).
  const {editorRef, handleMount, handleChange} = useMonacoValueSync({
    value: configEditorString,
    debounceMs: CONFIG_UPDATE_DEBOUNCE_MS,
    onSubmit: submitUserEdit,
  });

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
      handleMount(editor);

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
    [handleExtractConfig, handleMergeConfig, handleMount, props],
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
        defaultValue={configEditorString}
        onChange={handleChange}
        onMount={handleEditorMount}
      />
    </ResizeObserver>
  );
};

export default ConfigEditor;
