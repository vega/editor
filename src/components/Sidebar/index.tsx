import React, { Component } from 'react';
import { Menu } from 'react-feather';
import './index.css';

export default class Sidebar extends Component {
  public state = { isOpen: false };
  public render() {
    const classNames = this.state.isOpen ? 'settings open' : 'settings';
    return (
      <div>
        <div />
      </div>
    );
  }
}
