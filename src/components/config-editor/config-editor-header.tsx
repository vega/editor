import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {useCallback, useMemo} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {omit} from 'vega-lite';
import * as themes from 'vega-themes';
import * as EditorActions from '../../actions/editor.js';
import {State} from '../../constants/default-state.js';
import './config-editor.css';

interface ConfigEditorHeaderProps {
  themeName: string;
  manualParse: boolean;
  setConfig: (config: string) => void;
  setConfigEditorString: (config: string) => void;
  setThemeName: (themeName: string) => void;
}

const ConfigEditorHeader: React.FC<ConfigEditorHeaderProps> = (props) => {
  const vegaThemes = useMemo(() => omit(themes, ['version']), []);

  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.stopPropagation();
      if (e.target.value === 'custom') {
        props.setConfig('{}');
        props.setConfigEditorString('{}');
      } else {
        const themeConfig = stringify(vegaThemes[e.target.value]);
        props.setConfig(themeConfig);
        props.setConfigEditorString(themeConfig);
      }
      props.setThemeName(e.target.value);
    },
    [props.setConfig, props.setConfigEditorString, props.setThemeName, vegaThemes],
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLSelectElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <label className="config-header">
      Theme:
      <select value={props.themeName} onClick={handleClick} id="config-select" onChange={handleThemeChange}>
        <option value="custom">Custom</option>
        {Object.keys(vegaThemes).map((keyName) => (
          <option key={keyName} value={keyName}>
            {keyName}
          </option>
        ))}
      </select>
    </label>
  );
};

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setConfig: EditorActions.setConfig,
      setConfigEditorString: EditorActions.setConfigEditorString,
      setThemeName: EditorActions.setThemeName,
    },
    dispatch,
  );
}

function mapStateToProps(state: State) {
  return {
    manualParse: state.manualParse,
    themeName: state.themeName,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigEditorHeader);
