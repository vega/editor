import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import './index.css';

class Sidebar extends Component<any, any> {
  public render() {
    const renderOptions = this.props.renderer === 'svg' ? [{ label: 'canvas' }] : [{ label: 'svg' }];
    return (
      <div className="settings">
        <section>
          <div className="renderer-switch">
            <span className="renderer">Renderer:</span>
            <div>
              <Select
                className="renderer-dropdown"
                value={{ label: this.props.renderer }}
                options={renderOptions}
                isClearable={false}
                isSearchable={false}
                onChange={e => this.props.setRenderer(e.label)}
              />
            </div>
          </div>
          <div className="small-text">Sets the renderer</div>
          <div className="renderer-switch">
            <span>Log Level:</span>
            <div>
              <Select
                className="renderer-dropdown"
                value={{ label: 'None' }}
                options={[{ label: 'Warn' }, { label: 'Info' }, { label: 'Debug' }]}
              />
            </div>
          </div>
          <div className="small-text">Sets the log level</div>
          <div className="tooltips">
            <input type="checkbox" name="" id="tooltip" />
            <label htmlFor="tooltip">Tooltips</label>
          </div>
          <div className="hover-enable">
            <input type="checkbox" name="" id="hover-enable" />
            <label htmlFor="hover-enable">Hover Enable</label>
          </div>
        </section>
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    renderer: state.renderer,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setRenderer: EditorActions.setRenderer,
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
