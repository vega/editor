import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import ReactResizeDetector from 'react-resize-detector';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {debounce} from 'vega';
import {mapDispatchToProps, mapStateToProps} from '.';
import {SIDEPANE} from '../../constants';
import './config-editor.css';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{compressed: string}>;

class ConfigEditor extends React.PureComponent<Props> {
  public editor: Monaco.editor.IStandaloneCodeEditor;
  public handleEditorChange = (spec: string) => {
    const newSpec = spec === '' ? '{}' : spec;
    this.props.setConfigEditorString(newSpec);
    this.props.setThemeName('custom');
    if (this.props.manualParse) {
      return;
    }
    this.props.setConfig(this.props.configEditorString);
  };

  public handleMergeConfig() {
    const confirmation = confirm('The spec will be formatted on merge.');
    if (!confirmation) {
      return;
    }
    if (this.props.history.location.pathname !== '/edited') {
      this.props.history.push('/edited');
    }
    this.props.mergeConfigSpec();
  }

  public handleExtractConfig() {
    const confirmation = confirm('The spec and config will be formatted.');
    if (!confirmation) {
      return;
    }

    this.props.extractConfig();
  }

  public handleEditorMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.onDidFocusEditorText(() => {
      editor.deltaDecorations(this.props.decorations, []);
      this.props.setEditorReference(editor);
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 0,
      id: 'MERGE_CONFIG',
      label: 'Merge Config Into Spec',
      run: this.handleMergeConfig.bind(this),
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 1,
      id: 'EXTRACT_CONFIG',
      label: 'Extract Config From Spec',
      run: this.handleExtractConfig.bind(this),
    });

    this.editor = editor;

    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.editor.focus();
      this.editor.layout();
    }
  }

  public componentDidMount() {
    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.props.setEditorReference(this.editor);
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.editor.focus();
      this.editor.layout();
      this.props.setEditorReference(this.editor);
    }
  }

  public render() {
    return (
      <>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={(width: number, height: number) => {
            this.editor.layout({width, height: height});
          }}
        ></ReactResizeDetector>
        <MonacoEditor
          options={{
            autoClosingBrackets: 'never',
            autoClosingQuotes: 'never',
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: {enabled: false},
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          language="json"
          onChange={debounce(700, this.handleEditorChange)}
          value={this.props.configEditorString}
          editorDidMount={(e) => this.handleEditorMount(e)}
        />
      </>
    );
  }
}

export default withRouter(ConfigEditor);
