import React, { Component } from 'react';
import './index.css';

export default class Sidebar extends Component {
  public render() {
    return (
      <div className="settings">
        <div className="renderer-switch">
          <div className="toggleWrapper">
            <input type="checkbox" id="dn" className="dn" />
            <label htmlFor="dn" className="toggle">
              <span className="toggle__handler" />
            </label>
          </div>
        </div>
      </div>
    );
  }
}
