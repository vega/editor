import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import AppShell from '../../src/components/app-shell';
import {seedValidVegaLiteSpec} from '../setup';
import {expect} from 'vitest';

describe('Vizpane Component', () => {
  it('should render the vizpane and all its components', async () => {
    seedValidVegaLiteSpec();
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
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
