import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import setupMonaco from './utils/monaco.js';

import AppShell from './components/app-shell.js';
import configureStore from './store/configure-store.js';

if (typeof window !== 'undefined') {
  const w = window as any;
  w.VEGA_DEBUG = w.VEGA_DEBUG ?? {};
  w.VEGA_DEBUG = {};
  w.VEGA_DEBUG.vega = vega;
  w.VEGA_DEBUG.vegaLite = vegaLite;
  w.VEGA_DEBUG.VEGA_VERSION = vega.version;
  w.VEGA_DEBUG.VEGA_LITE_VERSION = vegaLite.version;
}

setupMonaco();

export const store = configureStore();

// Now that redux and react-router have been configured, we can render the
// React application to the DOM!
ReactDOM.render(
  <Provider store={store}>{React.createElement(HashRouter, {}, <AppShell />)}</Provider>,
  document.getElementById('root'),
);

/* tslint:disable */
console.log('%cWelcome to the Vega-Editor!', 'font-size: 16px; font-weight: bold;');
console.log(
  'You can access the Vega view with VEGA_DEBUG. Learn more at https://vega.github.io/vega/docs/api/debugging/.',
);
/* tslint:enable */
