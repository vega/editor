import * as React from 'react';

import {expect, afterEach, vi} from 'vitest';
import {cleanup, render} from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../src/context/app-context';
import AppShell from '../src/components/app-shell';

expect.extend(matchers);

export const renderApp = () => {
  return render(
    <HashRouter>
      <AppContextProvider>
        <AppShell />
      </AppContextProvider>
    </HashRouter>,
  );
};

export const seedValidVegaLiteSpec = () => {
  const validSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    data: {values: [{a: 1}]},
    mark: 'point',
    encoding: {x: {field: 'a', type: 'quantitative'}},
  };
  localStorage.setItem('state', JSON.stringify({editorString: JSON.stringify(validSpec), parse: true, error: null}));
};

// Set up global window objects
Object.defineProperty(window, 'VEGA_DEBUG', {
  writable: true,
  value: {},
});

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
