import React from 'react';
import {fireEvent, waitFor} from '@testing-library/react';
import {seedValidVegaLiteSpec} from '../setup';
import {expect} from 'vitest';
import {renderApp} from '../setup';

describe('Vizpane Component', () => {
  it('should render the vizpane and all its components', async () => {
    seedValidVegaLiteSpec();
    renderApp();

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
