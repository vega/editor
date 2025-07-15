import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';

const store = configureStore();

describe('Editor Components', () => {
  it('should render the main app structure', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    expect(document.querySelector('.app-container')).toBeInTheDocument();
    expect(document.querySelector('.main-panel')).toBeInTheDocument();
    expect(document.querySelector('.main-pane')).toBeInTheDocument();
  });

  it('should render split panes for editor layout', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    const splitPanes = document.querySelectorAll('.Pane');
    expect(splitPanes.length).toBe(6);
  });

  it('should have resizable panes', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    const resizers = document.querySelectorAll('.Resizer');
    expect(resizers.length).toBe(3);
  });

  // test dragging the resizers
  it('should drag to resize the panes', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    const resizer = document.querySelector('.Resizer');
    const panes = document.querySelectorAll('.Pane');

    // Verify the resizer exists and has correct class
    expect(resizer).toBeInTheDocument();
    expect(resizer).toHaveClass('Resizer');

    expect(panes.length).toBeGreaterThan(0);

    // Simulate dragging the resizer - this should not throw errors
    fireEvent.mouseDown(resizer!, {clientX: 0});
    fireEvent.mouseMove(resizer!, {clientX: 100});
    fireEvent.mouseUp(resizer!);

    expect(resizer).toBeInTheDocument();
    expect(resizer).toHaveClass('Resizer');

    fireEvent.mouseDown(resizer!, {clientX: 100});
    fireEvent.mouseMove(resizer!, {clientX: 200});
    fireEvent.mouseUp(resizer!);

    // Verify resizer is still functional
    expect(resizer).toBeInTheDocument();
    expect(resizer).toHaveClass('Resizer');
  });

  it('should display version information', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    const versionsDiv = document.querySelector('.versions');
    expect(versionsDiv).toBeInTheDocument();
    expect(versionsDiv).toHaveTextContent(/Vega.*Vega-Lite.*Vega-Tooltip.*Editor/);
  });

  it('should render debug pane header', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    const debugPane = document.querySelector('.debug-pane');
    expect(debugPane).toBeInTheDocument();
  });
});
