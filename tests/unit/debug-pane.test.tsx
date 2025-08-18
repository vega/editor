import React from 'react';
import {fireEvent, render, waitFor, within} from '@testing-library/react';

import {seedValidVegaLiteSpec} from '../setup';
import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import AppShell from '../../src/components/app-shell';
// Pane header component with class 'pane-header' should be present
// It should have 4 li elements that have text LOGS, DATA VIEWER, SIGNAL VIEWER, DATAFLOW VIEWER
// When you click on the pane header, check if debug-pane element is present

describe('Debug Pane Component', () => {
  it('renders the pane header with tabs', async () => {
    seedValidVegaLiteSpec();
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );

    const header = document.querySelector('.debug-pane .pane-header');
    expect(header).toBeInTheDocument();

    await waitFor(() => {
      const tabs = header!.querySelectorAll('.tabs-nav li');
      expect(tabs.length).toBe(4);
    });

    expect(within(header as HTMLElement).getByText(/Logs/i)).toBeInTheDocument();
    await within(header as HTMLElement).findByText(/Data Viewer/i);
    await within(header as HTMLElement).findByText(/Signal Viewer/i);
    await within(header as HTMLElement).findByText(/Dataflow Viewer/i);
  });

  it('shows debug pane after clicking the header', async () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );

    const header = document.querySelector('.debug-pane .pane-header');
    expect(header).toBeInTheDocument();

    fireEvent.click(header!);

    await waitFor(() => {
      const debugPane = document.querySelector('.debug-pane');
      expect(debugPane).toBeInTheDocument();
    });
  });

  it('activates Logs tab by default and switches active tab on click', async () => {
    seedValidVegaLiteSpec();
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );

    let header = document.querySelector('.debug-pane .pane-header') as HTMLElement;
    fireEvent.click(header);
    await waitFor(() => {
      const debugPane = document.querySelector('.debug-pane');
      expect(debugPane).toBeInTheDocument();
    });

    header = document.querySelector('.debug-pane .pane-header');
    const logsTab = within(header).getByText(/Logs/i).closest('li');
    await waitFor(() => expect(logsTab).toHaveClass('active-tab'));

    const dataViewerTabEl = await within(header).findByText(/Data Viewer/i);
    fireEvent.click(dataViewerTabEl);

    const dataViewerTab = dataViewerTabEl.closest('li');
    await waitFor(() => expect(dataViewerTab).toHaveClass('active-tab'));
    expect(logsTab).not.toHaveClass('active-tab');

    const logsTabEl = within(header).getByText(/Logs/i);
    fireEvent.click(logsTabEl);
    await waitFor(() => expect(logsTab).toHaveClass('active-tab'));
    expect(dataViewerTab).not.toHaveClass('active-tab');
  });
});
