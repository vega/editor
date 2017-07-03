import React from 'react';
import './index.css';

export default class Error extends React.Component {
  render() {
    if (this.props.error) {
      return (
        <div id='error-indicator' onClick={(e) => this.props.showErrorPane()}>
          {this.props.error}
        </div>
      );
    } else {
      return null;
    }
  }
}