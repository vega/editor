// Tests for SpecEditorHeader component
// Covers tab rendering, tab switching, and config header rendering

import React from 'react';
import {vi} from 'vitest';

import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import {fireEvent, render, screen} from '@testing-library/react';
import {SIDEPANE, Mode} from '../../src/constants/consts';
import AppShell from '../../src/components/app-shell';

vi.mock('@monaco-editor/react', () => {
  return {
    __esModule: true,
    default: (props) => {
      React.useEffect(() => {
        if (props.onMount) {
          props.onMount({
            focus: () => {},
            layout: () => {},
            onDidFocusEditorText: () => {},
            addAction: () => {},
            dispose: () => {},
            getModel: () => ({
              onDidChangeContent: () => {},
              onDidChangeModelContent: () => {},
              onDidChangeModelDecorations: () => {},
              getOptions: () => ({}),
            }),
            deltaDecorations: () => {},
          });
        }
      }, [props.onMount]);
      return <div data-testid="mock-monaco-editor" />;
    },
  };
});

describe('Spec Editor Header Component', () => {
  it('should render the mode and config tabs', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    // The tabs-nav should be present
    const tabsNav = document.querySelector('.editor-header.spec-editor-header .tabs-nav');
    expect(tabsNav).toBeInTheDocument();

    //Check that the tab nav element has li elements that have test Vega or Vega-Lite and Config
    const tabNavItems = document.querySelectorAll('.editor-header.spec-editor-header .tabs-nav li');
    expect(tabNavItems).toHaveLength(2);
    expect(tabNavItems[0]).toHaveTextContent(/Vega(-Lite)?/i);
    expect(tabNavItems[1]).toHaveTextContent(/Config/i);
  });

  it('should highlight the correct tab as active', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    // By default, the editor tab should be active
    const activeTab = document.querySelector('.editor-header.spec-editor-header .active-tab');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab).toHaveTextContent(/vega(-lite)?/i);
  });

  it('should switch to config tab and render ConfigEditorHeader', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    // Click the Config tab
    const configTab = screen.getByText('Config');
    fireEvent.click(configTab);

    // Now Config tab should be active
    const activeTab = document.querySelector('.editor-header.spec-editor-header .active-tab');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab).toHaveTextContent('Config');

    // ConfigEditorHeader should be rendered (look for Theme: label)
    expect(screen.getByText('Theme:')).toBeInTheDocument();
  });

  it('should switch back to editor tab when mode tab is clicked', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    // Click the Config tab first
    const configTab = screen.getByText('Config');
    fireEvent.click(configTab);

    expect(screen.queryByText('Theme:')).toBeInTheDocument();

    // Editor tab should be active again
    const activeTab = document.querySelector('.editor-header.spec-editor-header .active-tab');
    expect(activeTab).toBeInTheDocument();
    expect(activeTab).toHaveTextContent('Config');

    fireEvent.click(configTab);

    const tabNavItems = document.querySelectorAll('.editor-header.spec-editor-header .tabs-nav li');
    const specTab = tabNavItems[0];
    fireEvent.click(specTab);

    // ConfigEditorHeader should not be rendered
    expect(screen.queryByText('Theme:')).not.toBeInTheDocument();
  });
});
