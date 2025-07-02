import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import MonacoEditor from '@monaco-editor/react';
import {useNavigate} from 'react-router';
import {debounce} from 'vega';
import {SIDEPANE} from '../../constants/index.js';
import {useAppContext} from '../../context/app-context.js';
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

  const {state} = useAppContext();

  const {configEditorString, manualParse, decorations, sidePaneItem, editorRef: contextEditorRef} = state;

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
        try {
          editor.deltaDecorations(decorations, []);
        } catch (error) {
          console.warn('Failed to handle:', error);
        }
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
        try {
          editor.focus();
          editor.layout();
        } catch (error) {
          console.warn('Failed to handle:', error);
        }
      }
    },
    [decorations, sidePaneItem, handleMergeConfig, handleExtractConfig],
  );

  useEffect(() => {
    if (editorRef.current && editorRef.current !== contextEditorRef && sidePaneItem === SIDEPANE.Config) {
      props.setEditorReference(editorRef.current);
    }
  }, [editorRef.current, contextEditorRef, sidePaneItem, props.setEditorReference]);

  useEffect(() => {
    if (sidePaneItem === SIDEPANE.Config && editorRef.current) {
      try {
        editorRef.current.focus();
        editorRef.current.layout();
      } catch (error) {
        console.warn('Failed to handle:', error);
      }
    }
  }, [sidePaneItem]);

  const debouncedHandleEditorChange = useCallback(debounce(700, handleEditorChange), [handleEditorChange]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        try {
          editorRef.current?.layout({width, height});
        } catch (error) {
          console.warn('Failed to handle:', error);
        }
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
