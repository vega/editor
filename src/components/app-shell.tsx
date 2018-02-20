import * as React from 'react';
import {Route} from 'react-router-dom';

import App from './app';

type Props = {
  logPageView: Function;
};

export default class AppShell extends React.Component<Props> {
  public componentDidUpdate() {
    this.props.logPageView();
  }

  public render() {
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
