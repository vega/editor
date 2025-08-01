import stringify from 'json-stringify-pretty-compact';
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useAppContext} from '../../../context/app-context.js';
import './index.css';
import {EDITOR_FOCUS, KEYCODES, Mode, SCHEMA, SIDEPANE} from '../../../constants/index.js';
import {useLocation, useNavigate, useParams} from 'react-router';
import {parse as parseJSONC} from 'jsonc-parser';
import LZString from 'lz-string';
import ResizeObserver from 'rc-resize-observer';
import {debounce} from 'vega';
import parser from 'vega-schema-url-parser';

const EditorWithNavigation: React.FC<{
  clearConfig: () => void;
  extractConfigSpec: () => void;
  logError: (error: Error) => void;
  mergeConfigSpec: () => void;
  parseSpec: (force: boolean) => void;
  setConfig: (config: string) => void;
  setDecorations: (decorations: any[]) => void;
  setEditorFocus: (focus: string) => void;
  setEditorReference: (reference: any) => void;
  updateEditorString: (editorString: string) => void;
  updateVegaLiteSpec: (spec: string, config?: string) => void;
  updateVegaSpec: (spec: string, config?: string) => void;
}> = (props) => {
  const {state} = useAppContext();
  const {mode, editorString, decorations, manualParse, parse, sidePaneItem, configEditorString} = state;

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [currentDecorationIds, setCurrentDecorationIds] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const {compressed} = useParams<{compressed?: string}>();

  const updateSpec = useCallback(
    (spec: string, config: string = undefined) => {
      let parsedMode = mode;
      try {
        const schema = parseJSONC(spec).$schema;
        if (schema) {
          const parsedSchema = parser(schema);
          if (parsedSchema.library === 'vega-lite') {
            parsedMode = Mode.VegaLite;
          } else if (parsedSchema.library === 'vega') {
            parsedMode = Mode.Vega;
          }
        }
      } catch (e) {
        // spec is not a valid JSON
      }

      if (parsedMode === Mode.Vega) {
        props.updateVegaSpec(spec, config);
      } else if (parsedMode === Mode.VegaLite) {
        props.updateVegaLiteSpec(spec, config);
      } else {
        props.updateEditorString(spec);
      }
    },
    [mode, props.updateVegaSpec, props.updateVegaLiteSpec, props.updateEditorString],
  );

  const debouncedUpdateSpec = useCallback(debounce(700, updateSpec), [updateSpec]);

  useEffect(() => {
    if (compressed) {
      let spec: string = LZString.decompressFromEncodedURIComponent(compressed);
      if (spec) {
        try {
          const newlines = (spec.match(/\n/g) || '').length + 1;
          if (newlines <= 1) {
            spec = stringify(parseJSONC(spec));
          }
          if (spec !== editorString) {
            updateSpec(spec);
          }
        } catch (e) {
          props.logError(e as Error);
        }
      } else {
        props.logError(new Error(`Failed to decompress URL. Expected a specification, but received ${spec}`));
      }
    }
  }, [compressed, editorString, props.logError, updateSpec]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (manualParse) {
        if ((e.keyCode === KEYCODES.B || e.keyCode === KEYCODES.S) && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          props.parseSpec(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [manualParse, props.parseSpec]);

  useEffect(() => {
    if (editorRef.current && parse) {
      editorRef.current.focus();
      editorRef.current.layout();
      updateSpec(editorString, configEditorString);
      props.parseSpec(false);
    }
  }, [parse, editorString, configEditorString, updateSpec, props]);

  useEffect(() => {
    if (sidePaneItem === SIDEPANE.Editor && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.layout();
    }
  }, [sidePaneItem]);

  const handleEditorDidMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
      props.setEditorReference(editor);

      const addVegaSchemaURL = () => {
        try {
          let spec = parseJSONC(editor.getValue());
          if (spec.$schema === undefined) {
            spec = {
              $schema: SCHEMA[Mode.Vega],
              ...spec,
            };
            if (confirm('Adding schema URL will format the specification too.')) {
              props.updateVegaSpec(stringify(spec));
            }
          }
        } catch (e) {
          props.logError(e as Error);
        }
      };

      const addVegaLiteSchemaURL = () => {
        try {
          let spec = parseJSONC(editor.getValue());
          if (spec.$schema === undefined) {
            spec = {
              $schema: SCHEMA[Mode.VegaLite],
              ...spec,
            };
            if (confirm('Adding schema URL will format the specification too.')) {
              props.updateVegaLiteSpec(stringify(spec));
            }
          }
        } catch (e) {
          props.logError(e as Error);
        }
      };

      const handleMergeConfig = () => {
        if (confirm('The spec will be formatted on merge.')) {
          if (location.pathname !== '/edited') {
            navigate('/edited');
          }
          props.mergeConfigSpec();
        }
      };

      const handleExtractConfig = () => {
        if (confirm('The spec and config will be formatted.')) {
          props.extractConfigSpec();
        }
      };

      editor.onDidFocusEditorText(() => {
        props.setEditorFocus(EDITOR_FOCUS.SpecEditor);
        props.setEditorReference(editor);
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
        run: () => {
          mode === Mode.Vega ? navigate('/custom/vega') : navigate('/custom/vega-lite');
        },
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
    },
    [props, manualParse, debouncedUpdateSpec, location.pathname, navigate, mode],
  );

  const handleEditorChange = useCallback(
    (value: string) => {
      if (manualParse) {
        props.updateEditorString(value);
      } else {
        debouncedUpdateSpec(value);
      }
      if (location.pathname.indexOf('/edited') === -1) {
        navigate('/edited');
      }
    },
    [manualParse, props.updateEditorString, debouncedUpdateSpec, location.pathname, navigate],
  );

  useEffect(() => {
    if (editorRef.current && decorations && Array.isArray(decorations)) {
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
      <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div style={{flexGrow: 1, position: 'relative'}}>
          <Editor
            height="100%"
            language="json"
            value={editorString}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
              cursorBlinking: 'smooth',
              folding: true,
              lineNumbersMinChars: 4,
              minimap: {enabled: false},
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              quickSuggestions: true,
              stickyScroll: {
                enabled: true,
              },
            }}
          />
        </div>
      </div>
    </ResizeObserver>
  );
};

export default EditorWithNavigation;
