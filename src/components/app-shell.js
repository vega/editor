import React from 'react';
import {Route} from 'react-router-dom';

import App from './app';

export default class AppShell extends React.Component {
  componentDidUpdate() {
    this.props.logPageView();
  }

  render() {
    return (
      <div>
        <Route path='/' component={App} />
        <Route path='/edited' component={App} />
        <Route path='/gist/:mode/:username/:id' component={App} />
        <Route path='/examples/:mode/:example_name' component={App} />
        <Route path='/custom/:mode' component={App} />
      </div>
    );
  }
}
