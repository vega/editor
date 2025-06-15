import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import MonacoEditor from '@monaco-editor/react';
import {useNavigate, useParams} from 'react-router';
import {debounce} from 'vega';
import {SIDEPANE} from '../../constants/index.js';
import './config-editor.css';

type Props = {
  compiledVegaPaneSize: any;
  compiledVegaSpec: any;
  config: any;
  configEditorString: string;
  decorations: any[];
  editorRef: any;
  editorString: string;
  gist: any;
  manualParse: boolean;
  mode: any;
  parse: boolean;
  selectedExample: any;
  sidePaneItem: any;
  themeName: string;
  value: string;

  extractConfig: () => void;
  mergeConfigSpec: () => void;
  setConfig: (config: string) => void;
  setConfigEditorString: (configString: string) => void;
  setEditorReference: (reference: any) => void;
  setThemeName: (theme: string) => void;

  navigate?: (path: string) => void;
  params?: {compressed?: string};
};

const ConfigEditor: React.FC<Props> = (props) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const prevEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorChange = useCallback(
    (spec: string) => {
      const newSpec = spec === '' ? '{}' : spec;
      if (newSpec !== props.configEditorString) {
        props.setConfigEditorString(newSpec);
        props.setThemeName('custom');

        if (!props.manualParse) {
          props.setConfig(newSpec);
        }
      }
    },
    [props.setConfigEditorString, props.setThemeName, props.manualParse, props.setConfig, props.configEditorString],
  );

  const handleMergeConfig = useCallback(() => {
    const confirmation = confirm('The spec will be formatted on merge.');
    if (!confirmation) {
      return;
    }
    props.navigate('/edited');
    props.mergeConfigSpec();
  }, [props.navigate, props.mergeConfigSpec]);

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
        editor.deltaDecorations(props.decorations, []);
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

      if (props.sidePaneItem === SIDEPANE.Config) {
        editor.focus();
        editor.layout();
      }
    },
    [props.decorations, props.sidePaneItem, handleMergeConfig, handleExtractConfig],
  );

  useEffect(() => {
    if (editorRef.current && editorRef.current !== props.editorRef && props.sidePaneItem === SIDEPANE.Config) {
      prevEditorRef.current = editorRef.current;
      props.setEditorReference(editorRef.current);
    }
  }, [editorRef.current, props.editorRef, props.sidePaneItem, props.setEditorReference]);

  useEffect(() => {
    if (props.sidePaneItem === SIDEPANE.Config && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.layout();
    }
  }, [props.sidePaneItem]);

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
        defaultValue={props.configEditorString}
        onMount={handleEditorMount}
      />
    </div>
  );
};

const ConfigEditorWithNavigation = (props: Omit<Props, 'navigate' | 'params'>) => {
  const navigate = useNavigate();
  const params = useParams();
  return <ConfigEditor {...props} navigate={navigate} params={params} />;
};

export default ConfigEditorWithNavigation;
