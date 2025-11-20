import React from 'react';
import {fireEvent, waitFor, within} from '@testing-library/react';
import {seedValidVegaLiteSpec} from '../setup';
import {renderApp} from '../setup';

// Pane header component with class 'pane-header' should be present
// It should have 4 li elements that have text LOGS, DATA VIEWER, SIGNAL VIEWER, DATAFLOW VIEWER
// When you click on the pane header, check if debug-pane element is present

describe('Debug Pane Component', () => {
  it('renders the pane header with tabs', async () => {
    seedValidVegaLiteSpec();
    renderApp();

    const header = document.querySelector('.debug-pane .pane-header') as HTMLElement;
    expect(header).toBeInTheDocument();

    await waitFor(() => {
      const tabs = header.querySelectorAll('.tabs-nav li');
      expect(tabs.length).toBe(4);
    });

    expect(within(header).getByText(/Logs/i)).toBeInTheDocument();
    await within(header).findByText(/Data Viewer/i);
    await within(header).findByText(/Signal Viewer/i);
    await within(header).findByText(/Dataflow Viewer/i);
  });

  it('shows debug pane after clicking the header', async () => {
    renderApp();

    const header = document.querySelector('.debug-pane .pane-header') as HTMLElement;
    expect(header).toBeInTheDocument();

    fireEvent.click(header);

    await waitFor(() => {
      const debugPane = document.querySelector('.debug-pane');
      expect(debugPane).toBeInTheDocument();
    });
  });

  it('activates Logs tab by default and switches active tab on click', async () => {
    seedValidVegaLiteSpec();
    renderApp();

    let header = document.querySelector('.debug-pane .pane-header') as HTMLElement;
    fireEvent.click(header);
    await waitFor(() => {
      const debugPane = document.querySelector('.debug-pane');
      expect(debugPane).toBeInTheDocument();
    });

    header = document.querySelector('.debug-pane .pane-header') as HTMLElement;
    const logsTab = within(header).getByText(/Logs/i).closest('li') as HTMLElement;
    await waitFor(() => expect(logsTab).toHaveClass('active-tab'));

    const dataViewerTabEl = await within(header).findByText(/Data Viewer/i);
    fireEvent.click(dataViewerTabEl);

    const dataViewerTab = dataViewerTabEl.closest('li') as HTMLElement;
    await waitFor(() => expect(dataViewerTab).toHaveClass('active-tab'));
    expect(logsTab).not.toHaveClass('active-tab');

    const logsTabEl = within(header).getByText(/Logs/i);
    fireEvent.click(logsTabEl);
    await waitFor(() => expect(logsTab).toHaveClass('active-tab'));
    expect(dataViewerTab).not.toHaveClass('active-tab');
  });
});
