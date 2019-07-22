import React, { Component } from 'react';
import Select from 'react-select';
import './index.css';

class Sidebar extends Component<any, any> {
  private listnerAttached = false;
  private escListnerAttached = false;
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
      if (this.listnerAttached && window.innerWidth > 1000) {
        document.body.removeEventListener('click', this.handleOutsideClick, true);
      }
      if (!this.listnerAttached && window.innerWidth < 1000) {
        document.body.addEventListener('click', this.handleOutsideClick, true);
      }
    });
  }

  public handleEscClick(event) {
    // check if the window size is greater than 1000(threshold)
    if (window.innerWidth > 1000) {
      if (event.key === 'Escape') {
        this.props.setSettingsState(false);
      }
    }
  }

  public handleOutsideClick(event) {
    if (!this.listnerAttached && window.innerWidth < 1000) {
      if (
        (event.target as any).closest('.settings') ||
        (event.target as any).closest('.settings-button') ||
        (event.target as any).classList.contains('log-level-dropdown__option') ||
        (event.target as any).classList.contains('renderer-dropdown__option')
      ) {
        return;
      }
      this.props.setSettingsState(false);
      this.listnerAttached = true;
    }
  }

  public logOptions = () => {
    let options = [{ label: 'None' }, { label: 'Warn' }, { label: 'Info' }, { label: 'Debug' }];
    options = options.filter(o => o.label !== this.props.logLevel);
    return options;
  };

  public hoverOptions = () => {
    let options = [{ label: 'default' }, { label: 'on' }, { label: 'off' }];
    options = options.filter(o => o.label !== this.props.hoverEnable);
    return options;
  };

  public setHover(e) {
    let newHover: boolean | 'defualt' = 'defualt';
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
    const renderOptions = this.props.renderer === 'svg' ? [{ label: 'canvas' }] : [{ label: 'svg' }];
    const hover = typeof this.props.hoverEnable !== 'boolean' ? 'default' : this.props.hoverEnable ? 'on' : 'off';
    return (
      <div className="settings">
        <section>
          <div className="select-container">
            <span>Renderer:</span>
            <div>
              <Select
                className="renderer-dropdown-wrapper"
                classNamePrefix="renderer-dropdown"
                value={{ label: this.props.renderer }}
                options={renderOptions}
                isClearable={false}
                isSearchable={false}
                onChange={e => this.props.setRenderer(e.label)}
              />
            </div>
          </div>
          <div className="settings-description">Sets the renderer</div>
          <div className="select-container">
            <span>Log Level:</span>
            <div>
              <Select
                className="log-level-dropdown-wrapper"
                classNamePrefix="log-level-dropdown"
                value={{ label: this.props.logLevel }}
                options={this.logOptions()}
                onChange={e => this.props.setLogLevel(e.label)}
                isClearable={false}
                isSearchable={false}
              />
            </div>
          </div>
          <div className="settings-description">Sets the log level</div>
          <div className="select-container">
            <span>Hover :</span>
            <div className="hover-enable-select">
              <Select
                className="hover-enable-dropdown-wrapper"
                classNamePrefix="hover-enable-dropdown"
                value={{ label: hover }}
                options={this.hoverOptions()}
                onChange={this.setHover}
                isClearable={false}
                isSearchable={false}
              />
            </div>
          </div>
          <div className="settings-description">
            Enable <a href="https://vega.github.io/vega/docs/api/view/#view_hover">Hover</a> Event Processing
          </div>
          <div className="tooltips">
            <input
              onChange={e => this.props.setTooltip(e.target.checked)}
              type="checkbox"
              name=""
              id="tooltip"
              checked={this.props.tooltipEnable}
            />
            <label htmlFor="tooltip">Tooltips</label>
          </div>
          <div className="settings-description">
            Enables default <a href="https://github.com/vega/vega-tooltip">Vega Tooltip</a> handler
          </div>
        </section>
      </div>
    );
  }
}

export default Sidebar;
