import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {EDITOR_FOCUS, LAYOUT} from '../../../constants';
import {State} from '../../../constants/default-state';
import CompiledSpecDisplayHeader from '../compiled-spec-header';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class CompiledSpecDisplay extends React.PureComponent<Props> {
  public editor;

  public componentDidMount() {
    this.props.setCompiledEditorReference(this.editor);
  }

  public componentDidUpdate(prevProps) {
    if (this.props.compiledVegaPaneSize !== prevProps.compiledVegaPaneSize) {
      if (this.editor) {
        this.editor.layout();
      }
    }
  }

  public render() {
    return (
      <div className={'sizeFixEditorParent full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        <MonacoEditor
          height={this.props.compiledVegaPaneSize - LAYOUT.MinPaneSize}
          options={{
            automaticLayout: true,
            folding: true,
            minimap: {enabled: false},
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          ref="compiledEditor"
          language="json"
          value={stringify(this.props.value)}
          editorDidMount={editor => {
            editor.onDidFocusEditorText(() => {
              this.props.compiledEditorRef && this.props.compiledEditorRef.deltaDecorations(this.props.decorations, []);
              this.props.editorRef && this.props.editorRef.deltaDecorations(this.props.decorations, []);
              this.props.setEditorFocus(EDITOR_FOCUS.CompiledEditor);
            });
            this.editor = editor;
          }}
        />
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
    value: state.vegaSpec,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompiledSpecDisplay);
