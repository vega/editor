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

const LOG_OPTIONS = Object.entries(LEVEL_NAMES).map(([value, label]) => ({
  label,
  value: parseInt(value, 10),
}));

const HOVER_OPTIONS = [
  {label: 'Auto', value: 'auto'},
  {label: 'On', value: 'on'},
  {label: 'Off', value: 'off'},
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
      if (listenerAttachedRef.current || window.innerWidth > SIZE_THRESHOLD) {
        return;
      }
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
    },
    [props.setSettingsState],
  );

  const handleResize = useCallback(() => {
    if (window.innerWidth <= SIZE_THRESHOLD) {
      if (!listenerAttachedRef.current) {
        document.body.addEventListener('click', handleOutsideClick, true);
        listenerAttachedRef.current = true;
      }
    } else if (listenerAttachedRef.current) {
      document.body.removeEventListener('click', handleOutsideClick, true);
      listenerAttachedRef.current = false;
    }
  }, [handleOutsideClick]);

  useEffect(() => {
    handleResize();
    window.addEventListener('keydown', handleEscClick, true);
    window.addEventListener('resize', handleResize);

    return () => {
      if (listenerAttachedRef.current) {
        document.body.removeEventListener('click', handleOutsideClick, true);
      }
      window.removeEventListener('keydown', handleEscClick, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleEscClick, handleResize, handleOutsideClick]);

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
  const hoverValue = typeof props.hoverEnable !== 'boolean' ? 'auto' : props.hoverEnable ? 'on' : 'off';

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
            value={{label: hover, value: hoverValue}}
            options={HOVER_OPTIONS}
            onChange={(option: any) => {
              const value = option.value;
              if (value === 'auto') {
                props.setHover('auto');
              } else if (value === 'on') {
                props.setHover(true);
              } else {
                props.setHover(false);
              }
            }}
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
