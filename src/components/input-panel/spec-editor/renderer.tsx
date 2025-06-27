import stringify from 'json-stringify-pretty-compact';
import LZString from 'lz-string';
import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import MonacoEditor from '@monaco-editor/react';
import {useNavigate, useParams} from 'react-router';
import {debounce} from 'vega';
import parser from 'vega-schema-url-parser';
import {EDITOR_FOCUS, KEYCODES, Mode, SCHEMA, SIDEPANE} from '../../../constants/index.js';
import './index.css';
import {parse as parseJSONC} from 'jsonc-parser';

type Props = {
  compiledEditorRef: any;
  compiledVegaPaneSize: any;
  compiledVegaSpec: any;
  configEditorString: string;
  decorations: any[];
  editorFocus: any;
  editorRef: any;
  editorString: string;
  gist: any;
  manualParse: boolean;
  mode: Mode;
  parse: boolean;
  selectedExample: any;
  sidePaneItem: any;
  themeName: string;
  value: string;
  view: any;

  clearConfig: () => void;
  extractConfigSpec: () => void;
  logError: (error: Error) => void;
  mergeConfigSpec: () => void;
  parseSpec: (force: boolean) => void;
  setConfig: (config: string) => void;
  setDecorations: (decorations: any[]) => void;
  setEditorFocus: (focus: any) => void;
  setEditorReference: (reference: any) => void;
  updateEditorString: (editorString: string) => void;
  updateVegaLiteSpec: (spec: string, config?: string) => void;
  updateVegaSpec: (spec: string, config?: string) => void;

  navigate: (path: string) => void;
  params: {compressed?: string};
};

const Editor: React.FC<Props> = (props) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const parseButtonRef = useRef<HTMLButtonElement>(null);

  const prevEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (props.manualParse) {
        if ((e.keyCode === KEYCODES.B || e.keyCode === KEYCODES.S) && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          props.parseSpec(true);
          const parseButton = parseButtonRef.current;
          if (parseButton) {
            parseButton.classList.add('pressed');
            setTimeout(() => {
              parseButton.classList.remove('pressed');
            }, 250);
          }
        }
      }
    },
    [props.manualParse, props.parseSpec],
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
    props.extractConfigSpec();
  }, [props.extractConfigSpec]);

  const onSelectNewVega = useCallback(() => {
    props.navigate('/custom/vega');
  }, [props.navigate]);

  const onSelectNewVegaLite = useCallback(() => {
    props.navigate('/custom/vega-lite');
  }, [props.navigate]);

  const onClear = useCallback(() => {
    props.mode === Mode.Vega ? onSelectNewVega() : onSelectNewVegaLite();
  }, [props.mode, onSelectNewVega, onSelectNewVegaLite]);

  const addVegaSchemaURL = useCallback(() => {
    let spec = parseJSONC(props.editorString);
    if (spec.$schema === undefined) {
      spec = {
        $schema: SCHEMA[Mode.Vega],
        ...spec,
      };
      if (confirm('Adding schema URL will format the specification too.')) {
        props.updateVegaSpec(stringify(spec));
      }
    }
  }, [props.editorString, props.updateVegaSpec]);

  const addVegaLiteSchemaURL = useCallback(() => {
    let spec = parseJSONC(props.editorString);
    if (spec.$schema === undefined) {
      spec = {
        $schema: SCHEMA[Mode.VegaLite],
        ...spec,
      };
      if (confirm('Adding schema URL will format the specification too.')) {
        props.updateVegaLiteSpec(stringify(spec));
      }
    }
  }, [props.editorString, props.updateVegaLiteSpec]);

  const updateSpec = useCallback(
    (spec: string, config: string = undefined) => {
      let parsedMode = props.mode;

      const schema = parseJSONC(spec).$schema;

      if (schema) {
        switch (parser(schema).library) {
          case 'vega-lite':
            parsedMode = Mode.VegaLite;
            break;
          case 'vega':
            parsedMode = Mode.Vega;
            break;
        }
      }

      switch (parsedMode) {
        case Mode.Vega:
          props.updateVegaSpec(spec, config);
          break;
        case Mode.VegaLite:
          props.updateVegaLiteSpec(spec, config);
          break;
        default:
          console.error(`Unknown mode:  ${parsedMode}`);
          break;
      }
    },
    [props.mode, props.updateVegaSpec, props.updateVegaLiteSpec],
  );

  const editorDidMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      editor.onDidFocusEditorText(() => {
        props.compiledEditorRef && props.compiledEditorRef.deltaDecorations(props.decorations, []);
        editor.createDecorationsCollection(props.decorations);
        props.setEditorFocus(EDITOR_FOCUS.SpecEditor);
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 0,
        id: 'ADD_VEGA_SCHEMA',
        label: 'Add Vega schema URL',
        run: addVegaSchemaURL,
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 1,
        id: 'ADD_VEGA_LITE_SCHEMA',
        label: 'Add Vega-Lite schema URL',
        run: addVegaLiteSchemaURL,
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 2,
        id: 'CLEAR_EDITOR',
        label: 'Clear Spec',
        run: onClear,
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 3,
        id: 'MERGE_CONFIG',
        label: 'Merge Config Into Spec',
        run: handleMergeConfig,
      });

      editor.addAction({
        contextMenuGroupId: 'vega',
        contextMenuOrder: 4,
        id: 'EXTRACT_CONFIG',
        label: 'Extract Config From Spec',
        run: handleExtractConfig,
      });

      editor.getModel().getOptions();

      editorRef.current = editor;

      if (props.sidePaneItem === SIDEPANE.Editor) {
        editor.focus();
        editor.layout();
        props.setEditorFocus(EDITOR_FOCUS.SpecEditor);
      }
    },
    [
      props.compiledEditorRef,
      props.decorations,
      props.setEditorFocus,
      props.sidePaneItem,
      addVegaSchemaURL,
      addVegaLiteSchemaURL,
      onClear,
      handleMergeConfig,
      handleExtractConfig,
    ],
  );

  const handleEditorChange = useCallback(
    (spec: string) => {
      if (props.manualParse) {
        props.updateEditorString(spec);
      } else if (spec !== props.editorString) {
        updateSpec(spec);
      }
      props.navigate('/edited');
    },
    [props.manualParse, props.updateEditorString, props.navigate, updateSpec, props.editorString],
  );

  const editorWillMount = useCallback(() => {
    const compressed = props.params.compressed;
    if (compressed) {
      let spec: string = LZString.decompressFromEncodedURIComponent(compressed);

      if (spec) {
        const newlines = (spec.match(/\n/g) || '').length + 1;
        if (newlines <= 1) {
          console.log('Formatting spec string from URL that did not contain newlines.');
          spec = stringify(parseJSONC(spec));
        }

        updateSpec(spec);
      } else {
        props.logError(new Error(`Failed to decompress URL. Expected a specification, but received ${spec}`));
      }
    }
  }, [props.params.compressed, props.logError, updateSpec]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  useEffect(() => {
    if (editorRef.current && editorRef.current !== props.editorRef && props.sidePaneItem === SIDEPANE.Editor) {
      prevEditorRef.current = editorRef.current;
      props.setEditorReference(editorRef.current);
    }
  }, [editorRef.current, props.editorRef, props.sidePaneItem, props.setEditorReference]);

  useEffect(() => {
    if (props.sidePaneItem === SIDEPANE.Editor && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.layout();
    }
  }, [props.sidePaneItem]);

  useEffect(() => {
    if (props.compiledEditorRef) {
      props.compiledEditorRef.deltaDecorations(props.decorations, []);
    }
    if (editorRef.current) {
      editorRef.current.deltaDecorations(props.decorations, []);
    }
  }, [props.view, props.compiledEditorRef, props.decorations]);

  useEffect(() => {
    if (editorRef.current && props.parse) {
      editorRef.current.focus();
      editorRef.current.layout();
      updateSpec(props.value, props.configEditorString);
      props.parseSpec(false);
    }
  }, [props.parse, props.value, props.configEditorString, updateSpec, props.parseSpec]);

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
        value={props.editorString}
        onMount={editorDidMount}
        beforeMount={editorWillMount}
      />
    </div>
  );
};

const EditorWithNavigation = (props: Omit<Props, 'navigate' | 'params'>) => {
  const navigate = useNavigate();
  const params = useParams();
  return <Editor {...props} navigate={navigate} params={params} />;
};

export default EditorWithNavigation;
