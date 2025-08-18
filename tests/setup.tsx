import React from 'react';

import {expect, afterEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

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
