import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';

const store = configureStore();

describe('Vizpane Component', () => {
  it('should render the vizpane and all its components', async () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );
    // Make sure to have the vega/vega-lite version text
    const versionClass = document.querySelector('.versions');
    expect(versionClass).toBeInTheDocument();

    // Check if fullscreen button (fullscreen-open) exists
    const fsButton = document.querySelector('.fullscreen-open');
    expect(fsButton).toBeInTheDocument();

    // Find and click the SVG element inside the fullscreen button
    const svgElement = fsButton?.querySelector('svg');
    expect(svgElement).toBeInTheDocument();

    // Click the SVG element directly
    fireEvent.click(svgElement!);

    // Wait for the fullscreen-close button to appear in the portal
    await waitFor(() => {
      const editVis = document.querySelector('.fullscreen-close');
      expect(editVis).toBeInTheDocument();
    });
  });
});
