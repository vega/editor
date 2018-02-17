import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactGA from 'react-ga';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import createHashHistory from 'history/createHashHistory';
import * as vega from 'vega';
import * as vl from 'vega-lite';

import AppShell from './components/app-shell';
import configureStore from './store/configure-store';

window.VEGA_DEBUG = window.VEGA_DEBUG || {};
window.VEGA_DEBUG.vega = vega;
window.VEGA_DEBUG.vl = vl;
window.VEGA_DEBUG.VEGA_VERSION = vega.version;
window.VEGA_DEBUG.VEGA_LITE_VERSION = vl.version;

const hashHistory = createHashHistory();

// Configure history for react-router
const store = configureStore(hashHistory);

// Google analytics
ReactGA.initialize('UA-44428446-7');

function logPageView() {
  ReactGA.set({page: window.location.pathname + window.location.search});
  ReactGA.pageview(window.location.pathname + window.location.search);
}

// Now that redux and react-router have been configured, we can render the
// React application to the DOM!
ReactDOM.render(
  (
    <Provider store={store}>
      <ConnectedRouter history={hashHistory}>
        <AppShell logPageView={logPageView} />
      </ConnectedRouter>
    </Provider>
  ),
  document.getElementById('root'),
);

/* eslint-disable */
console.log('%cWelcome to the Vega-Editor!', 'font-size: 16px; font-weight: bold;');
console.log('You can access the Vega view with VEGA_DEBUG. Learn more at https://vega.github.io/vega/docs/api/debugging/.');
