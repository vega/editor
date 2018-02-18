/** @format */

import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter, Route} from 'react-router-dom';
import * as ReactGA from 'react-ga';
import * as React from 'react';
import * as vl from 'vega-lite';
import * as vega from 'vega';
import AppShell from './components/app-shell';
import configureStore from './store/configure-store';

declare global {
  interface Window {
    VEGA_DEBUG: {
      vega?: {};
      view?: any; // $FixMe
      vl?: {};
      VEGA_VERSION?: string;
      VEGA_LITE_VERSION?: string;
    };
  }
}

window.VEGA_DEBUG = window.VEGA_DEBUG || {};
window.VEGA_DEBUG = {};
window.VEGA_DEBUG.vega = vega;
window.VEGA_DEBUG.vl = vl;
window.VEGA_DEBUG.VEGA_VERSION = vega.version;
window.VEGA_DEBUG.VEGA_LITE_VERSION = vl.version;

// Google analytics
ReactGA.initialize('UA-44428446-7');

function logPageView() {
  ReactGA.set({page: window.location.pathname + window.location.search});
  ReactGA.pageview(window.location.pathname + window.location.search);
}

const store = configureStore();

// Now that redux and react-router have been configured, we can render the
// React application to the DOM!
ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <AppShell logPageView={logPageView} />
    </HashRouter>
  </Provider>,
  document.getElementById('root'),
);
/* eslint-disable */
console.log(
  '%cWelcome to the Vega-Editor!',
  'font-size: 16px; font-weight: bold;',
);
console.log(
  'You can access the Vega view with VEGA_DEBUG. Learn more at https://vega.github.io/vega/docs/api/debugging/.',
);
