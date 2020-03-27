import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {omit} from 'vega-lite/build/src/util';
import * as themes from 'vega-themes';
import * as EditorActions from '../../actions/editor';
import {State} from '../../constants/default-state';
import './config-editor.css';

class ConfigEditorHeader extends React.PureComponent<any, any> {
  public render() {
    const vegaThemes = omit(themes, ['version']);

    return (
      <label className="config-header">
        Theme:
        <select
          value={this.props.themeName}
          onClick={(e) => e.stopPropagation()}
          id="config-select"
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.value === 'custom') {
              this.props.setConfig('{}');
              this.props.setConfigEditorString('{}');
            } else {
              this.props.setConfig(stringify(vegaThemes[e.target.value]));
              this.props.setConfigEditorString(stringify(vegaThemes[e.target.value]));
            }
            this.props.setThemeName(e.target.value);
          }}
        >
          <option value="custom">Custom</option>
          {Object.keys(vegaThemes).map((keyName) => {
            return (
              <option key={keyName} value={keyName}>
                {keyName}
              </option>
            );
          })}
        </select>
      </label>
    );
  }
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

function mapStateToProps(state: State) {
  return {
    manualParse: state.manualParse,
    themeName: state.themeName,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigEditorHeader);
