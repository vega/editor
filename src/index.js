import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import {Provider} from 'react-redux'
import configureStore from './store/configure-store';
import {hashHistory, Router, Route} from 'react-router';

import * as vega from 'vega';
import * as vl from 'vega-lite';

window.VEGA_DEBUG = window.VEGA_DEBUG || {};
window.VEGA_DEBUG.VEGA_VERSION = vega.version;
window.VEGA_DEBUG.VEGA_LITE_VERSION = vl.version;

// Configure history for react-router
const store = configureStore(hashHistory);

// Now that redux and react-router have been configured, we can render the
// React application to the DOM!
ReactDOM.render(
  (
    <Provider store={store}>
      <Router history={hashHistory} >
        <Route path='/' component={App} />
        <Route path='/edited' component={App} />
        <Route path='/gist/:mode/:username/:id' component={App} />
        <Route path='/examples/:mode/:example_name' component={App} />
        <Route path='/custom/:mode' component={App} />
      </Router>
    </Provider>
  ),
  document.getElementById('root'),
);

/*eslint-disable */
console.log('%cWelcome to the Vega-Editor!', 'font-size: 16px; font-weight: bold;');
console.log('You can access the Vega view with VEGA_DEBUG. Learn more at https://vega.github.io/vega/docs/api/debugging/.');
