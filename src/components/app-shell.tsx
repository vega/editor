import * as React from 'react';
import {Route, Switch} from 'react-router-dom';

import App from './app';
import Reset from './reset';

export default class AppShell extends React.PureComponent {
  public render() {
    return (
      <div>
        <Switch>
          <Route path="/" exact component={App} />
          <Route path="/reset" component={() => <Reset />} />
          <Route path="/edited" component={App} />
          <Route exact path="/gist/:id/:filename" component={App} />
          <Route path="/gist/:id/:revision/:filename" component={App} />
          <Route path="/examples/:mode/:example_name" component={App} />
          <Route path="/examples/:mode" component={() => <App showExample={true} />} />
          <Route path="/examples" component={() => <App showExample={true} />} />
          <Route path="/custom/:mode" component={App} />
          <Route path="/url/:mode/:compressed" component={App} />
        </Switch>
      </div>
    );
  }
}
