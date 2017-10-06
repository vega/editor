import React from 'react';
import PropTypes from 'prop-types';
import ErrorIndicator from '../error-indicator';

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    logError: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  componentDidCatch(error, info) {
    this.setState({hasError: true});

    this.props.logError(error.toString());
  }

  render() {
    if (this.state.hasError) {
      return <ErrorIndicator />;
    }
    return this.props.children;
  }
}