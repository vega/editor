import React, { Component } from 'react';
import { Menu } from 'react-feather';
import './index.css';

export default class Sidebar extends Component {
  public state = { isOpen: true };
  public render() {
    const classNames = this.state.isOpen ? 'settings open' : 'settings';
    return (
      <div onClick={() => this.setState({ isOpen: !this.state.isOpen })} className={'header-button'}>
        <Menu className="header-icon" />
        <div className={classNames}>Testing Phase...</div>
      </div>
    );
  }
}
