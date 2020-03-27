import React, {Component} from 'react';
import Select from 'react-select';
import './index.css';

/**
 * Window size in pizels after which we make the settings panel a popover.
 */
const SIZE_THRESHOLD = 1000;

class Sidebar extends Component<any, any> {
  private listnerAttached = false;
  public constructor(props) {
    super(props);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleEscClick = this.handleEscClick.bind(this);
    this.setHover = this.setHover.bind(this);
  }
  public componentDidMount() {
    // add click event listner depending on the screen size
    document.body.addEventListener('click', this.handleOutsideClick, true);

    // add escape event listner depending on the screen size
    window.addEventListener('keydown', this.handleEscClick, true);

    // remove or add event listeners if the window is resized;
    window.addEventListener('resize', () => {
      if (this.listnerAttached && window.innerWidth > SIZE_THRESHOLD) {
        document.body.removeEventListener('click', this.handleOutsideClick, true);
      }
      if (!this.listnerAttached && window.innerWidth <= SIZE_THRESHOLD) {
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
    if (!this.listnerAttached && window.innerWidth <= SIZE_THRESHOLD) {
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
      this.listnerAttached = true;
    }
  }

  public logOptions = () => {
    let options = [{label: 'None'}, {label: 'Warn'}, {label: 'Info'}, {label: 'Debug'}];
    options = options.filter((o) => o.label !== this.props.logLevel);
    return options;
  };

  public hoverOptions = () => {
    let options = [{label: 'auto'}, {label: 'on'}, {label: 'off'}];
    const selected =
      typeof this.props.hoverEnable !== 'boolean' ? this.props.hoverEnable : this.props.hoverEnable ? 'on' : 'off';
    options = options.filter((o) => o.label !== selected);
    return options;
  };

  public setHover(e) {
    let newHover: boolean | 'auto' = 'auto';
    switch (e.label) {
      case 'on':
        newHover = true;
        break;
      case 'off':
        newHover = false;
    }
    this.props.setHover(newHover);
  }

  public render() {
    const hover = typeof this.props.hoverEnable !== 'boolean' ? 'auto' : this.props.hoverEnable ? 'on' : 'off';

    const renderers = [
      {value: 'svg', label: 'SVG'},
      {value: 'canvas', label: 'Canvas'},
    ].map((d) => (
      <label key={d.label}>
        <input
          type="radio"
          name="renderer"
          value={d.value}
          defaultChecked={this.props.renderer === d.value}
          onClick={(e) => this.props.setRenderer(e.currentTarget.value)}
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
              defaultValue={this.props.backgroundColor}
              onInput={(e) => this.props.setBackgroundColor((e.target as HTMLTextAreaElement).value)}
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
              value={{label: this.props.logLevel}}
              options={this.logOptions()}
              onChange={(e) => this.props.setLogLevel(e.label)}
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
              options={this.hoverOptions()}
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
              onChange={(e) => this.props.setTooltip(e.target.checked)}
              type="checkbox"
              name=""
              id="tooltip"
              checked={this.props.tooltipEnable}
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
