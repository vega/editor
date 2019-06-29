import React, { Component } from 'react';
import Select from 'react-select';
import './index.css';

export default class Sidebar extends Component {
  public render() {
    return (
      <div className="settings">
        <div className="renderer-switch">
          Renderer :
          <Select className="data-dropdown" clearable={false} searchable={false} />
        </div>
      </div>
    );
  }
}
