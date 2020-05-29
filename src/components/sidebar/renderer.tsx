import React, {Component} from 'react';
import Select from 'react-select';
import './index.css';

/**
 * Window size in pizels after which we make the settings panel a popover.
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

const HOVER_OPTIONS = [{label: 'Auto'}, {label: 'On'}, {label: 'Off'}];

class Sidebar extends Component<any, any> {
  private listenerAttached = false;
  public constructor(props) {
    super(props);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleEscClick = this.handleEscClick.bind(this);
    this.setHover = this.setHover.bind(this);
  }
  public componentDidMount() {
    // add click event listener depending on the screen size
    document.body.addEventListener('click', this.handleOutsideClick, true);

    // add escape event listener depending on the screen size
    window.addEventListener('keydown', this.handleEscClick, true);

    // remove or add event listeners if the window is resized;
    window.addEventListener('resize', () => {
      if (this.listenerAttached && window.innerWidth > SIZE_THRESHOLD) {
        document.body.removeEventListener('click', this.handleOutsideClick, true);
      }
      if (!this.listenerAttached && window.innerWidth <= SIZE_THRESHOLD) {
        document.body.addEventListener('click', this.handleOutsideClick, true);
      }
    });
  }

  public handleEscClick(event) {
    // check if the window size is smaller than 1000(threshold)
    if (window.innerWidth <= SIZE_THRESHOLD) {
      if (event.key === 'Escape') {
        this.props.setSettingsState(false);
      }
    }
  }

  public handleOutsideClick(event) {
    if (!this.listenerAttached && window.innerWidth <= SIZE_THRESHOLD) {
      const target: any = event.target;
      if (
        target.closest('.settings') ||
        target.closest('.settings-button') ||
        target.classList.contains('log-level-dropdown__option') ||
        target.classList.contains('renderer-dropdown__option')
      ) {
        return;
      }
      this.props.setSettingsState(false);
      this.listenerAttached = true;
    }
  }

  public setHover(e) {
    let newHover = null;
    switch (e.label) {
      case 'On':
        newHover = true;
        break;
      case 'Off':
        newHover = false;
        break;
      case 'Auto':
        newHover = 'auto';
    }
    this.props.setHover(newHover);
  }

  public render() {
    const {
      logLevel,
      renderer,
      setRenderer,
      setBackgroundColor,
      backgroundColor,
      setLogLevel,
      setTooltip,
      tooltipEnable,
    } = this.props;

    const hover = typeof this.props.hoverEnable !== 'boolean' ? 'Auto' : this.props.hoverEnable ? 'On' : 'Off';

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
              onInput={(e) => setBackgroundColor((e.target as HTMLTextAreaElement).value)}
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
          <span>Hover :</span>
          <div className="hover-enable-select">
            <Select
              className="hover-enable-dropdown-wrapper"
              classNamePrefix="hover-enable-dropdown"
              value={{label: hover}}
              options={HOVER_OPTIONS}
              onChange={this.setHover}
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
      </div>
    );
  }
}

export default Sidebar;
