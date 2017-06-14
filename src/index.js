import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import { Provider } from 'react-redux'
import configureStore from './store/configure-store';
import { hashHistory, Router, Route } from 'react-router';

import * as vega from 'vega';
import * as vl from 'vega-lite';

window.VEGA_DEBUG = window.VEGA_DEBUG || {};
window.VEGA_DEBUG.VEGA_VERSION = vega.version;
window.VEGA_DEBUG.VEGA_LITE_VERSION = vl.version;

// Create redux store and sync with react-router-redux. We have installed the
// react-router-redux reducer under the key "router" in src/routes/index.js,
// so we need to provide a custom `selectLocationState` to inform
// react-router-redux of its location.
const initialState = window.__INITIAL_STATE__;

// Configure history for react-router

const store = configureStore(initialState);

// Now that redux and react-router have been configured, we can render the
// React application to the DOM!
ReactDOM.render(
  (
    <Provider store={store}>
      <Router history={hashHistory} >
        <Route path='/' component={App} />
        <Route path='/:mode' component={App} />
        <Route path='/:mode/edited' component={App} />
        <Route path='/gist/:vega/:username/:id' component={App} />
        <Route path='/examples/:vega/:example_name' component={App} />
      </Router>
    </Provider>
  ),
  document.getElementById('root'),
);


