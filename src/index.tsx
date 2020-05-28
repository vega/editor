import * as React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import setupMonaco from './utils/monaco';

import AppShell from './components/app-shell';
import configureStore from './store/configure-store';

declare global {
  interface Window {
    VEGA_DEBUG: {
      vega?: typeof vega;
      view?: vega.View;
      vegaLite?: typeof vegaLite;
      VEGA_VERSION?: string;
      VEGA_LITE_VERSION?: string;
    };
  }
}

window.VEGA_DEBUG = window.VEGA_DEBUG || {};
window.VEGA_DEBUG = {};
window.VEGA_DEBUG.vega = vega;
window.VEGA_DEBUG.vegaLite = vegaLite;
window.VEGA_DEBUG.VEGA_VERSION = vega.version;
window.VEGA_DEBUG.VEGA_LITE_VERSION = vegaLite.version;

setupMonaco();

export const store = configureStore();

// Now that redux and react-router have been configured, we can render the
// React application to the DOM!
ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <AppShell />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

/* tslint:disable */
console.log('%cWelcome to the Vega-Editor!', 'font-size: 16px; font-weight: bold;');
console.log(
  'You can access the Vega view with VEGA_DEBUG. Learn more at https://vega.github.io/vega/docs/api/debugging/.'
);
/* tslint:enable */
