import stringify from 'json-stringify-pretty-compact';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { debounce } from 'vega';
import { mergeDeep } from 'vega-lite/build/src/util';
import { mapDispatchToProps, mapStateToProps } from '.';
import { SIDEPANE } from '../../constants';
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

    if (this.props.configEditorString === '{}') {
      this.props.parseSpec(true);
      return;
    }

    try {
      const spec = JSON.parse(this.props.editorString);
      const config = JSON.parse(this.props.configEditorString);
      if (spec.config) {
        spec.config = mergeDeep(config, spec.config);
      } else {
        spec.config = config;
      }
      this.props.updateEditorString(stringify(spec));

      this.props.clearConfig();
    } catch (e) {
      console.warn(e);
    }

    this.props.parseSpec(true);
  }

  public handleExtractConfig() {
    const confirmation = confirm('The spec and config will be formatted.');
    if (!confirmation) {
      return;
    }

    try {
      const spec = JSON.parse(this.props.editorString);
      let config = JSON.parse(this.props.configEditorString);
      if (spec.config) {
        config = mergeDeep(config, spec.config);
        delete spec.config;
        this.props.updateEditorString(stringify(spec));
        this.props.setConfigEditorString(stringify(config));
      }
    } catch (e) {
      console.warn(e);
    }
    this.props.parseSpec(true);
  }

  public handleEditorMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.addAction({
      id: 'MERGE_CONFIG',
      label: 'Merge config into spec',
      run: () => {
        this.handleMergeConfig();
      },
    });

    editor.addAction({
      id: 'EXTRACT_CONFIG',
      label: 'Extract config from spec',
      run: () => {
        this.handleExtractConfig();
      },
    });
    this.editor = editor;
    this.editor.focus();
  }

  public componentDidMount() {
    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.props.setEditorReference(this.refs.ConfigEditor);
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.sidePaneItem === SIDEPANE.Config) {
      this.editor.focus();
      if (nextProps.sidePaneItem === SIDEPANE.Config) {
        this.props.setEditorReference(this.refs.ConfigEditor);
      }
    }
  }

  public render() {
    return (
      <div
        style={{ display: this.props.sidePaneItem === SIDEPANE.Editor ? 'none' : '' }}
        className="sizeFixEditorParent full-height-wrapper"
      >
        <MonacoEditor
          options={{
            autoClosingBrackets: 'never',
            autoClosingQuotes: 'never',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: { enabled: false },
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
