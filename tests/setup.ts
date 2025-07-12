import {expect, afterEach, vi} from 'vitest';
import {cleanup} from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Set up global window objects that the app expects
Object.defineProperty(window, 'VEGA_DEBUG', {
  writable: true,
  value: {},
});

// Mock window.open for tests
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

afterEach(() => {
  cleanup();
});
