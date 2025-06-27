import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {HashRouter as Router} from 'react-router-dom';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import setupMonaco from './utils/monaco.js';

import AppShell from './components/app-shell.js';
import configureStore from './store/configure-store.js';

console.log('Vega Editor initializing...');

if (typeof window !== 'undefined') {
  const w = window as any;
  w.VEGA_DEBUG = w.VEGA_DEBUG ?? {};
  w.VEGA_DEBUG = {};
  w.VEGA_DEBUG.vega = vega;
  w.VEGA_DEBUG.vegaLite = vegaLite;
  w.VEGA_DEBUG.VEGA_VERSION = vega.version;
  w.VEGA_DEBUG.VEGA_LITE_VERSION = vegaLite.version;
  console.log('Vega versions set on window.VEGA_DEBUG');
}

try {
  console.log('Setting up Monaco editor...');
  setupMonaco();
  console.log('Monaco editor setup complete');
} catch (error) {
  console.error('Error during setup of Monaco editor:', error);
}

export const store = configureStore();
console.log('Store configuration complete');

try {
  console.log('Rendering React application...');
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }

  if (!(container as any)._reactRootContainer) {
    const root = createRoot(container);
    (container as any)._reactRootContainer = root;
  }

  (container as any)._reactRootContainer.render(
    <React.StrictMode>
      <Provider store={store}>
        <Router basename="/">
          <AppShell />
        </Router>
      </Provider>
    </React.StrictMode>,
  );
  console.log('React application rendered');
} catch (error) {
  console.error('Error during React rendering:', error);
}

/* tslint:disable */
console.log('%cWelcome to the Vega-Editor!', 'font-size: 16px; font-weight: bold;');
console.log(
  'You can access the Vega view with VEGA_DEBUG. Learn more at https://vega.github.io/vega/docs/api/debugging/.',
);
/* tslint:enable */
