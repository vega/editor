import Editor from '@monaco-editor/react';
import * as React from 'react';
import {useAppContext} from '../../../context/app-context.js';
import './index.css';

const EditorWithNavigation: React.FC<{
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
}> = (props) => {
  const {state} = useAppContext();
  const {mode, editorString, decorations, manualParse} = state;

  const editorRef = React.useRef(null);

  const handleEditorDidMount = React.useCallback(
    (editor) => {
      editorRef.current = editor;
      props.setEditorReference(editor);

      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        props.updateEditorString(value);
        if (!manualParse) {
          props.parseSpec(true);
        }
      });

      editor.onDidFocusEditorText(() => {
        props.setEditorFocus(true);
      });

      editor.onDidBlurEditorText(() => {
        props.setEditorFocus(false);
      });
    },
    [props, manualParse],
  );

  React.useEffect(() => {
    if (editorRef.current && decorations) {
      editorRef.current.deltaDecorations([], decorations);
    }
  }, [decorations]);

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{flexGrow: 1, position: 'relative'}}>
        <Editor
          height="100%"
          language={mode === 'vega-lite' ? 'json' : 'json'}
          value={editorString}
          onMount={handleEditorDidMount}
          options={{
            folding: true,
            lineNumbers: 'on',
            renderLineHighlight: 'gutter',
            minimap: {enabled: true},
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorWithNavigation;
