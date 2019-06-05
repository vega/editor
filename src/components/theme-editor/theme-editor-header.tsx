import * as React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as themes from 'vega-themes';
import * as EditorActions from '../../actions/editor';
import './theme-editor.css';

class ThemeEditorHeader extends React.Component<any, any> {
  public render() {
    return (
      <div className="theme-header" style={{ position: 'static' }}>
        <select
          onClick={e => e.stopPropagation()}
          id="theme_select"
          onChange={e => {
            e.stopPropagation();
            this.props.setCurrentTheme(themes[e.target.value]);
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
      setCurrentTheme: EditorActions.setCurrentTheme,
    },
    dispatch
  );
}

export default connect(
  undefined,
  mapDispatchToProps
)(ThemeEditorHeader);
