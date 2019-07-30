import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { debounce } from 'vega';
import { mapDispatchToProps, mapStateToProps } from '.';
import { SIDEPANE } from '../../constants';
import './config-editor.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & { history: any; match: any };

export default class ConfigEditor extends React.PureComponent<Props> {
  public handleEditorChange = spec => {
    const newSpec = spec === '' ? '{}' : spec;
    this.props.setConfigEditorString(newSpec);
    this.props.setThemeName('custom');
    if (this.props.manualParse) {
      return;
    }
    this.props.setConfig(this.props.configEditorString);
  };

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
        />
      </div>
    );
  }
}
