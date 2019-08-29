import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {debounce} from 'vega';
import {mapDispatchToProps, mapStateToProps} from '.';
import {LAYOUT, Mode, SIDEPANE} from '../../constants';
import './config-editor.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export default class ConfigEditor extends React.PureComponent<Props> {
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
    }
  }

  public componentDidMount() {
    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.props.setEditorReference(this.refs.ConfigEditor);
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.sidePaneItem === SIDEPANE.Config) {
      this.editor.focus();
      this.props.setEditorReference(this.refs.ConfigEditor);
    }
  }

  public getEditorHeight() {
    // height of header : 60
    // height of compiled Spec Header :30
    let height = window.innerHeight - 60 - LAYOUT.MinPaneSize - 30; // 60 is the height of header;
    if (this.props.compiledVegaSpec) {
      height -= this.props.compiledVegaPaneSize - 30;
    }
    return height;
  }
  public render() {
    return (
      <div
        className={this.props.mode === Mode.Vega ? 'full-height-wrapper' : ''}
        style={{display: this.props.sidePaneItem === SIDEPANE.Editor ? 'none' : ''}}
      >
        <MonacoEditor
          height={this.getEditorHeight()}
          options={{
            autoClosingBrackets: 'never',
            autoClosingQuotes: 'never',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: {enabled: false},
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          ref="ConfigEditor"
          language="json"
          onChange={debounce(700, this.handleEditorChange)}
          value={this.props.configEditorString}
          editorDidMount={e => this.handleEditorMount(e)}
        />
      </div>
    );
  }
}
