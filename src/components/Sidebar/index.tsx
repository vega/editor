import React, { Component } from 'react';
import Select from 'react-select';
import './index.css';

export default class Sidebar extends Component {
  public render() {
    return (
      <div className="settings">
        <div className="renderer-switch">
          <span className="renderer">Renderer:</span>
          <div>
            <Select className="renderer-dropdown" clearable={false} searchable={false} />
          </div>
        </div>
        <div className="tooltips">
          <input type="checkbox" name="" id="tooltip" />
          <label htmlFor="tooltip">Tooltips</label>
        </div>
        <div className="hover-enable">
          <input type="checkbox" name="" id="hover-enable" />
          <label htmlFor="hover-enable">Hover Enable</label>
        </div>
      </div>
    );
  }
}
