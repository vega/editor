import './index.css';

import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    logError: PropTypes.func,
    showErrorPane: PropTypes.func,
    error: PropTypes.string
  }

  componentDidCatch(error, info) {
    this.props.logError(error.toString());
  }

  render() {
    if (this.props.error) {
      return <div id='error-indicator' onClick={(e) => this.props.showErrorPane()}>
        {this.props.error}
      </div>
    }
    return this.props.children;
  }
}
