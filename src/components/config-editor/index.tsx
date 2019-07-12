import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { debounce } from 'vega';
import * as EditorActions from '../../actions/editor';
import './config-editor.css';

class ConfigEditor extends React.PureComponent<any, any> {
  public handleEditorChange = spec => {
    const newSpec = spec === '' ? '{}' : spec;
    this.props.setConfigEditorString(newSpec);
    this.props.setThemeName('custom');
    (document.getElementById('config-select') as any).value = 'custom';
    if (this.props.manualParse) {
      return;
    }
    this.props.setConfig(JSON.parse(this.props.configEditorString));
  };
  public render() {
    return (
      <div className="sizeFixEditorParent full-height-wrapper">
        <MonacoEditor
          options={{
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
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    config: state.config,
    configEditorString: state.configEditorString,
    manualParse: state.manualParse,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setConfig: EditorActions.setConfig,
      setConfigEditorString: EditorActions.setConfigEditorString,
      setThemeName: EditorActions.setThemeName,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigEditor);
