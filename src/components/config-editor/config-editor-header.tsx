import * as React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as themes from 'vega-themes';
import * as EditorActions from '../../actions/editor';
import './config-editor.css';

class ConfigEditorHeader extends React.Component<any, any> {
  public componentDidMount() {
    (document.getElementById('config-select') as any).value = this.props.themeName;
  }
  public render() {
    return (
      <div className="config-header" style={{ position: 'static' }}>
        <div id="config-heading">Theme :</div>
        <select
          onClick={e => e.stopPropagation()}
          id="config-select"
          onChange={e => {
            e.stopPropagation();
            this.props.setConfig(themes[e.target.value]);
            this.props.setThemeName(e.target.value);
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
      </div>
    );
  }
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setConfig: EditorActions.setConfig,
      setThemeName: EditorActions.setThemeName,
    },
    dispatch
  );
}

function mapStateToProps(state) {
  return {
    themeName: state.themeName,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigEditorHeader);
