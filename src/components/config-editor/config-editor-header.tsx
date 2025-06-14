import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {useCallback, useMemo} from 'react';
import {omit} from 'vega-lite';
import * as themes from 'vega-themes';
import * as EditorActions from '../../actions/editor.js';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import './config-editor.css';

const ConfigEditorHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const {themeName} = useAppSelector((state) => ({
    themeName: state.themeName,
  }));

  const vegaThemes = useMemo(() => omit(themes, ['version']), []);

  const setConfig = useCallback((config: string) => dispatch(EditorActions.setConfig(config)), [dispatch]);

  const setConfigEditorString = useCallback(
    (config: string) => dispatch(EditorActions.setConfigEditorString(config)),
    [dispatch],
  );

  const setThemeName = useCallback(
    (themeNameValue: string) => dispatch(EditorActions.setThemeName(themeNameValue)),
    [dispatch],
  );

  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.stopPropagation();
      if (e.target.value === 'custom') {
        setConfig('{}');
        setConfigEditorString('{}');
      } else {
        const themeConfig = stringify(vegaThemes[e.target.value]);
        setConfig(themeConfig);
        setConfigEditorString(themeConfig);
      }
      setThemeName(e.target.value);
    },
    [setConfig, setConfigEditorString, setThemeName, vegaThemes],
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLSelectElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <label className="config-header">
      Theme:
      <select value={themeName} onClick={handleClick} id="config-select" onChange={handleThemeChange}>
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

export default ConfigEditorHeader;
