import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {useCallback} from 'react';
import {omit} from 'vega-lite';
import * as themes from 'vega-themes';
import {useAppContext} from '../../context/app-context.js';
import './config-editor.css';

const vegaThemes = omit(themes, ['version']);

const ConfigEditorHeader: React.FC = () => {
  const {state, setState} = useAppContext();
  const {themeName} = state;

  const setConfig = useCallback((config: string) => setState((s) => ({...s, configEditorString: config})), [setState]);

  const setConfigEditorString = useCallback(
    (configEditorString: string) => setState((s) => ({...s, configEditorString})),
    [setState],
  );

  const setThemeName = useCallback(
    (newThemeName: string) => setState((s) => ({...s, themeName: newThemeName})),
    [setState],
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
    [setConfig, setConfigEditorString, setThemeName],
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
