import React, { Component } from 'react';
import Select from 'react-select';
import './index.css';

class Sidebar extends Component<any, any> {

  private listenerAttached = false;
  public constructor(props) {
    super(props);
    this.handleOutSideClick = this.handleOutSideClick.bind(this);
  }
  public componentDidMount() {
    document.body.addEventListener('click', this.handleOutSideClick, true);
    window.addEventListener('resize', () => {
      if (this.listenerAttached && window.innerWidth > 1000) {
        document.body.removeEventListener('click', this.handleOutSideClick, true);
      }
      if (!this.listenerAttached && window.innerWidth < 1000) {
        document.body.addEventListener('click', this.handleOutSideClick, true);
      }
    });
  }

  public handleOutSideClick(event) {
    if (!this.listenerAttached && window.innerWidth < 1000) {
      if (
        (event.target as any).closest('.settings') ||
        (event.target as any).closest('.settings-button') ||
        (event.target as any).classList.contains('log-level-dropdown__option') ||
        (event.target as any).classList.contains('renderer-dropdown__option')
      ) {
        return;
      }
      this.props.setSettingState(false);
      this.listenerAttached = true;
    }
  }

  public logOptions = () => {
    let options = [{ label: 'None' }, { label: 'Warn' }, { label: 'Info' }, { label: 'Debug' }];
    options = options.filter(o => o.label !== this.props.logLevel);
    return options;
  };
  public render() {
    const renderOptions = this.props.renderer === 'svg' ? [{ label: 'canvas' }] : [{ label: 'svg' }];
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
          <div className="small-text">Sets the renderer</div>
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
          <div className="small-text">Sets the log level</div>
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
          <div className="small-text">Enables the default tooltip handler</div>
          <div className="small-text">
            Refer : <a href="https://github.com/vega/vega-tooltip">Vega Tooltip</a>
          </div>
          <div className="hover-enable">
            <input
              onChange={e => this.props.setHover(e.target.checked)}
              type="checkbox"
              name=""
              id="hover-enable"
              checked={this.props.hoverEnable}
            />
            <label htmlFor="hover-enable">Enable Hover Processing</label>
          </div>
          <div className="small-text">
            Refer : <a href="https://vega.github.io/vega/docs/api/view/#view_hover">Vega Docs</a>
          </div>
        </section>
      </div>
    );
  }
}

export default Sidebar;
