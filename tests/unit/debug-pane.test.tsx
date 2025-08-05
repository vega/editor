import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';

// Pane header component with class 'pane-header' should be present
// It should have 4 li elements that have test LOGS, DATA VIEWER, SIGNAL VIEWER, DATAFLOW VIEWER
// When you click on the pane header, check if debug-pane element is present

const store = configureStore();

describe('Debug Pane Component', () => {
  it('should render the pane header', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    const paneHeader = document.querySelector('.pane-header');
    expect(paneHeader).toBeInTheDocument();

    const liElements = paneHeader?.querySelectorAll('li');
    expect(liElements).toHaveLength(4);

    const logsLi = liElements?.[0];
    expect(logsLi).toHaveTextContent('Logs');

    const dataViewerLi = liElements?.[1];
    expect(dataViewerLi).toHaveTextContent('Data Viewer');

    const signalViewerLi = liElements?.[2];
    expect(signalViewerLi).toHaveTextContent('Signal Viewer');

    const dataflowViewerLi = liElements?.[3];
    expect(dataflowViewerLi).toHaveTextContent('Dataflow Viewer');

    const debugPane = document.querySelector('.debug-pane');

    fireEvent.click(logsLi);
    expect(debugPane).toBeInTheDocument();
  });
});
