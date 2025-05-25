import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from '@monaco-editor/react';
import {connect, useDispatch, useSelector} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor.js';
import {EDITOR_FOCUS, LAYOUT, COMPILEDPANE} from '../../../constants/index.js';
import {State} from '../../../constants/default-state.js';
import CompiledSpecDisplayHeader from '../compiled-spec-header/index.js';
import ResizeObserver from 'rc-resize-observer';
import {useEffect, useRef} from 'react';

function CompiledSpecDisplay() {
  const props = useSelector((state: State) => mapStateToProps(state));
  const dispatch = useDispatch();
  const dispatchProps = mapDispatchToProps(dispatch);

  const editorRef = useRef(null);

  //store editor reference in redux store
  useEffect(() => {
    dispatchProps.setCompiledEditorReference(editorRef.current);
  }, [editorRef.current]);

  return (
    <div className={'full-height-wrapper'}>
      <CompiledSpecDisplayHeader />
      <ResizeObserver
        onResize={({width, height}) => {
          editorRef.current?.layout({width, height});
        }}
      >
        <MonacoEditor
          height={props.compiledVegaPaneSize - LAYOUT.MinPaneSize}
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
          value={stringify(props.value)}
          onMount={(monacoEditor) => {
            monacoEditor.onDidFocusEditorText(() => {
              props.compiledEditorRef && props.compiledEditorRef.deltaDecorations(props.decorations, []);
              props.editorRef && props.editorRef.deltaDecorations(props.decorations, []);
              dispatchProps.setEditorFocus(EDITOR_FOCUS.CompiledEditor);
            });
            editorRef.current = monacoEditor;
          }}
        />
      </ResizeObserver>
    </div>
  );
}

// class CompiledSpecDisplay extends React.PureComponent<Props> {
//   public editor: monaco.editor.IStandaloneCodeEditor | null = null;

//   public componentDidMount() {
//     this.props.setCompiledEditorReference(this.editor);
//   }

//   public render() {
//     return (
//       <div className={'full-height-wrapper'}>
//         <CompiledSpecDisplayHeader />
//         <ResizeObserver
//           onResize={({ width, height }) => {
//             this.editor?.layout({ width, height });
//           }}
//         >
//           <MonacoEditor
//             height={this.props.compiledVegaPaneSize - LAYOUT.MinPaneSize}
//             options={{
//               folding: true,
//               minimap: { enabled: false },
//               readOnly: true,
//               scrollBeyondLastLine: false,
//               wordWrap: 'on',
//               stickyScroll: {
//                 enabled: false,
//               },
//             }}
//             language="json"
//             value={stringify(this.props.value)}
//             onMount={(editor) => {
//               editor.onDidFocusEditorText(() => {
//                 this.props.compiledEditorRef &&
//                   this.props.compiledEditorRef.deltaDecorations(this.props.decorations, []);
//                 this.props.editorRef && this.props.editorRef.deltaDecorations(this.props.decorations, []);
//                 this.props.setEditorFocus(EDITOR_FOCUS.CompiledEditor);
//               });
//               this.editor = editor;
//             }}
//           />
//         </ResizeObserver>
//       </div>
//     );
//   }
// }

function mapStateToProps(state: State) {
  return {
    compiledEditorRef: state.compiledEditorRef,
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    decorations: state.decorations,
    editorRef: state.editorRef,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    value: state.compiledPaneItem == COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setCompiledEditorReference: EditorActions.setCompiledEditorRef,
      setEditorFocus: EditorActions.setEditorFocus,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplay);
