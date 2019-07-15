import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import './index.css';

class Sidebar extends Component<any, any> {
  public componentDidMount() {
    if (window.innerWidth > 1000) {
      return;
    }
    document.addEventListener(
      'click',
      event => {
        if (
          (event.target as any).closest('.settings') ||
          (event.target as any).closest('.settings-button') ||
          (event.target as any).classList.contains('log-level-dropdown__option') ||
          (event.target as any).classList.contains('renderer-dropdown__option')
        ) {
          return;
        }
        this.props.setSettingState(false);
      },
      false
    );
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
          <div className="hover-enable">
            <input
              onChange={e => this.props.setHover(e.target.checked)}
              type="checkbox"
              name=""
              id="hover-enable"
              checked={this.props.hoverEnable}
            />
            <label htmlFor="hover-enable">Hover Enable</label>
          </div>
        </section>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setHover: EditorActions.setHover,
      setLogLevel: EditorActions.setLogLevel,
      setRenderer: EditorActions.setRenderer,
      setSettingState: EditorActions.setSettingState,
      setTooltip: EditorActions.setTooltip,
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
