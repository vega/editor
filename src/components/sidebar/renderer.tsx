import React, {useCallback, useEffect, useRef} from 'react';
import Select from 'react-select';
import './index.css';

/**
 * Window size in pixels after which we make the settings panel a popover.
 */
const SIZE_THRESHOLD = 1000;

const LEVEL_NAMES = {
  0: 'None',
  1: 'Error',
  2: 'Warn',
  3: 'Info',
  4: 'Debug',
};

const LOG_OPTIONS = [
  {label: LEVEL_NAMES[0], value: 0},
  {label: LEVEL_NAMES[1], value: 1},
  {label: LEVEL_NAMES[2], value: 2},
  {label: LEVEL_NAMES[3], value: 3},
  {label: LEVEL_NAMES[4], value: 4},
];

const HOVER_OPTIONS = [
  {label: 'Auto', value: 'Auto'},
  {label: 'On', value: 'On'},
  {label: 'Off', value: 'Off'},
];

interface SidebarProps {
  hoverEnable: boolean | 'auto';
  logLevel: number;
  renderer: string;
  tooltipEnable: boolean;
  backgroundColor: string;
  expressionInterpreter: boolean;
  setHover: (hover: boolean | 'auto') => void;
  setLogLevel: (level: number) => void;
  setRenderer: (renderer: string) => void;
  setSettingsState: (state: boolean) => void;
  setTooltip: (enabled: boolean) => void;
  setBackgroundColor: (color: string) => void;
  setExpressionInterpreter: (enabled: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const listenerAttachedRef = useRef(false);

  const handleEscClick = useCallback(
    (event: KeyboardEvent) => {
      if (window.innerWidth <= SIZE_THRESHOLD && event.key === 'Escape') {
        props.setSettingsState(false);
      }
    },
    [props.setSettingsState],
  );

  const handleOutsideClick = useCallback(
    (event: Event) => {
      if (!listenerAttachedRef.current && window.innerWidth <= SIZE_THRESHOLD) {
        const target: any = event.target;
        if (
          target.closest('.settings') ||
          target.closest('.settings-button') ||
          target.classList.contains('log-level-dropdown__option') ||
          target.classList.contains('renderer-dropdown__option')
        ) {
          return;
        }
        props.setSettingsState(false);
        listenerAttachedRef.current = true;
      }
    },
    [props.setSettingsState],
  );

  const handleResize = useCallback(() => {
    if (listenerAttachedRef.current && window.innerWidth > SIZE_THRESHOLD) {
      document.body.removeEventListener('click', handleOutsideClick, true);
      listenerAttachedRef.current = false;
    }
    if (!listenerAttachedRef.current && window.innerWidth <= SIZE_THRESHOLD) {
      document.body.addEventListener('click', handleOutsideClick, true);
      listenerAttachedRef.current = true;
    }
  }, [handleOutsideClick]);

  const setHover = useCallback(
    (e: {label: string; value: string}) => {
      let newHover: boolean | 'auto' = 'auto';
      switch (e.label) {
        case 'On':
          newHover = true;
          break;
        case 'Off':
          newHover = false;
          break;
        case 'Auto':
          newHover = 'auto';
          break;
      }
      props.setHover(newHover);
    },
    [props.setHover],
  );

  useEffect(() => {
    document.body.addEventListener('click', handleOutsideClick, true);

    window.addEventListener('keydown', handleEscClick, true);

    window.addEventListener('resize', handleResize);

    return () => {
      document.body.removeEventListener('click', handleOutsideClick, true);
      window.removeEventListener('keydown', handleEscClick, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleOutsideClick, handleEscClick, handleResize]);

  const {
    logLevel,
    renderer,
    setRenderer,
    setBackgroundColor,
    backgroundColor,
    setLogLevel,
    setTooltip,
    tooltipEnable,
    expressionInterpreter,
    setExpressionInterpreter,
  } = props;

  const hover = typeof props.hoverEnable !== 'boolean' ? 'Auto' : props.hoverEnable ? 'On' : 'Off';

  const renderers = [
    {value: 'svg', label: 'SVG'},
    {value: 'canvas', label: 'Canvas'},
  ].map((d) => (
    <label key={d.label}>
      <input
        type="radio"
        name="renderer"
        value={d.value}
        defaultChecked={renderer === d.value}
        onClick={(e) => setRenderer(e.currentTarget.value)}
      />
      {d.label}
    </label>
  ));

  return (
    <div className="settings">
      <div className="select-container">
        <span>Renderer:</span>
        {renderers}
      </div>
      <p className="settings-description">
        Set Vega renderer. Canvas creates pixel graphics. SVG creates vector graphics.
      </p>
      <div className="select-container">
        <span>Background Color:</span>
        <div>
          <input
            type="color"
            id="head"
            name="head"
            defaultValue={backgroundColor}
            onInput={(e) => setBackgroundColor((e.target as HTMLInputElement).value)}
          />
        </div>
      </div>
      <p className="settings-description">Background color of the visualization panel.</p>
      <div className="select-container">
        <span>Log Level:</span>
        <div>
          <Select
            className="log-level-dropdown-wrapper"
            classNamePrefix="log-level-dropdown"
            value={{value: logLevel, label: LEVEL_NAMES[logLevel]}}
            options={LOG_OPTIONS}
            onChange={(e: any) => setLogLevel(e.value)}
            isClearable={false}
            isSearchable={false}
          />
        </div>
      </div>
      <p className="settings-description">Set log level for Vega.</p>
      <div className="select-container">
        <span>Hover:</span>
        <div className="hover-enable-select">
          <Select
            className="hover-enable-dropdown-wrapper"
            classNamePrefix="hover-enable-dropdown"
            value={{label: hover, value: hover}}
            options={HOVER_OPTIONS}
            onChange={setHover}
            isClearable={false}
            isSearchable={false}
          />
        </div>
      </div>
      <p className="settings-description">
        Enable or disable{' '}
        <a href="https://vega.github.io/vega/docs/api/view/#view_hover" target="_blank" rel="noopener noreferrer">
          hover
        </a>{' '}
        event processing. In auto mode, Vega-Lite disables hover event processing.
      </p>
      <div className="tooltips">
        <label>
          <input
            onChange={(e) => setTooltip(e.target.checked)}
            type="checkbox"
            name=""
            id="tooltip"
            checked={tooltipEnable}
          />
          Tooltips
        </label>
      </div>
      <p className="settings-description">
        Enable the default{' '}
        <a href="https://github.com/vega/vega-tooltip" rel="noopener noreferrer" target="_blank">
          Vega Tooltip
        </a>{' '}
        handler.
      </p>
      <div className="expression-interpreter">
        <label>
          <input
            onChange={(e) => setExpressionInterpreter(e.target.checked)}
            type="checkbox"
            name=""
            id="expressionInterpreter"
            checked={expressionInterpreter}
          />
          Expression Interpreter
        </label>
      </div>
      <p className="settings-description">
        Enables the{' '}
        <a href="https://vega.github.io/vega/usage/interpreter/" rel="noopener noreferrer" target="_blank">
          Expression Interpreter
        </a>
        , which is{' '}
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" rel="noopener noreferrer" target="_blank">
          CSP
        </a>{' '}
        compliant.
      </p>
    </div>
  );
};

export default Sidebar;
