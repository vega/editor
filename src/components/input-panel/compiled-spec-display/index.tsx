import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {EDITOR_FOCUS, LAYOUT, COMPILEDPANE} from '../../../constants';
import {State} from '../../../constants/default-state';
import CompiledSpecDisplayHeader from '../compiled-spec-header';
import ResizeObserver from 'rc-resize-observer';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class CompiledSpecDisplay extends React.PureComponent<Props> {
  public editor;

  public componentDidMount() {
    this.props.setCompiledEditorReference(this.editor);
  }

  public render() {
    return (
      <div className={'full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        <ResizeObserver
          onResize={({width, height}) => {
            this.editor.layout({width, height: height});
          }}
        >
          <MonacoEditor
            height={this.props.compiledVegaPaneSize - LAYOUT.MinPaneSize}
            options={{
              folding: true,
              minimap: {enabled: false},
              readOnly: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
            language="json"
            value={stringify(this.props.value)}
            editorDidMount={(editor) => {
              editor.onDidFocusEditorText(() => {
                this.props.compiledEditorRef &&
                  this.props.compiledEditorRef.deltaDecorations(this.props.decorations, []);
                this.props.editorRef && this.props.editorRef.deltaDecorations(this.props.decorations, []);
                this.props.setEditorFocus(EDITOR_FOCUS.CompiledEditor);
              });
              this.editor = editor;
            }}
          />
        </ResizeObserver>
      </div>
    );
  }
}

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
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplay);
