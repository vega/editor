import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as themes from 'vega-themes';
import * as EditorActions from '../../actions/editor';
import './config-editor.css';

class ConfigEditorHeader extends React.PureComponent<any, any> {
  public componentDidMount() {
    (document.getElementById('config-select') as any).value = this.props.themeName;
  }
  public render() {
    return (
      <label className="config-header">
        Theme:
        <select
          onClick={e => e.stopPropagation()}
          id="config-select"
          onChange={e => {
            e.stopPropagation();
            this.props.setConfigEditorString(stringify(themes[e.target.value]));
            this.props.setThemeName(e.target.value);
            this.props.setConfig(themes[e.target.value]);
          }}
        >
          <option value="custom">Custom</option>
          {Object.keys(themes).map((keyName, keyIndex) => {
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

function mapStateToProps(state) {
  return {
    manualParse: state.manualParse,
    themeName: state.themeName,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigEditorHeader);
