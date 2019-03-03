import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import App from './app';
import NotFound from './not-found/NotFound';

interface Props {
  logPageView: () => void;
}

export default class AppShell extends React.Component<Props> {
  public componentDidUpdate() {
    this.props.logPageView();
  }

  public render() {
    return (
      <div>
        <Switch>
          <Route path="/" exact component={App} />
          <Route exact path="/edited" component={App} />
          <Route exact path="/gist/:mode/:username/:id/:revision/:filename" component={App} />
          <Route exact path="/examples/:mode/:example_name" component={App} />
          <Route exact path="/custom/:mode" component={App} />
          <Route exact path="/url/:mode/:compressed" component={App} />
          <Route exact path="/examples" component={App} />
          <Route exact path="/examples/vega" component={App} />
          <Route exact path="/examples/vega-lite" component={App} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    );
  }
}
