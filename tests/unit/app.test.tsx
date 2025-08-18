import React from 'react';
import {render, screen} from '@testing-library/react';
import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import AppShell from '../../src/components/app-shell';

describe('App Component', () => {
  it('should render main app element', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );

    expect(screen.getByText('Vega-Lite')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const {container} = render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
