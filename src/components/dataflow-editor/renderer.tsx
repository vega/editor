import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ResizeObserver from 'rc-resize-observer';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {withRouter} from 'react-router-dom';
import {mapDispatchToProps, mapStateToProps} from '.';
import {SIDEPANE} from '../../constants';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class DataflowEditor extends React.PureComponent<Props> {
  public editor: Monaco.editor.IStandaloneCodeEditor;

  public handleEditorMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.onDidFocusEditorText(() => {
      this.props.setEditorReference(editor);
    });

    this.editor = editor;

    if (this.props.sidePaneItem === SIDEPANE.Dataflow) {
      this.editor.focus();
      this.editor.layout();
    }
  }

  public componentDidMount() {
    if (this.props.sidePaneItem === SIDEPANE.Dataflow) {
      this.props.setEditorReference(this.editor);
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.props.sidePaneItem === SIDEPANE.Dataflow) {
      this.editor.focus();
      this.editor.layout();
      this.props.setEditorReference(this.editor);
    }
  }

  public render() {
    return (
      <ResizeObserver
        onResize={({width, height}) => {
          this.editor.layout({width, height: height});
        }}
      >
        <MonacoEditor
          language="json"
          options={{
            folding: true,
            minimap: {enabled: false},
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          value={JSON.stringify(this.props.runtime, null, 2)}
          editorDidMount={(e) => this.handleEditorMount(e)}
        />
      </ResizeObserver>
    );
  }
}

export default withRouter(DataflowEditor);
