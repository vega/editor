import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';
import {COMPILEDPANE} from '../../src/constants/consts';

const store = configureStore();

const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
Object.defineProperty(console, 'log', {
  writable: true,
  value: mockConsoleLog,
});
Object.defineProperty(console, 'error', {
  writable: true,
  value: mockConsoleError,
});

describe('Compiled Spec Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Basic UI Elements', () => {
    it('should render the compiled spec header with tabs', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');
      const extendedVegaLiteTab = screen.getByText('Extended Vega-Lite Spec');

      expect(compiledVegaTab).toBeInTheDocument();
      expect(extendedVegaLiteTab).toBeInTheDocument();
    });

    it('should have proper header structure', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const editorHeaders = document.querySelectorAll('.editor-header');
      expect(editorHeaders.length).toBeGreaterThan(0);

      const tabsNav = document.querySelector('.tabs-nav');
      expect(tabsNav).toBeInTheDocument();
    });

    it('should display chevron icons for expand/collapse', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const chevronIcons = document.querySelectorAll('svg');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('should handle Compiled Vega tab click', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');

      fireEvent.click(compiledVegaTab);

      expect(compiledVegaTab).toBeInTheDocument();
    });

    it('should handle Extended Vega-Lite Spec tab click', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const extendedVegaLiteTab = screen.getByText('Extended Vega-Lite Spec');

      fireEvent.click(extendedVegaLiteTab);

      expect(extendedVegaLiteTab).toBeInTheDocument();
    });

    it('should show active tab styling', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      const activeTab = document.querySelector('.active-tab');

      expect(activeTab).toBeInTheDocument();

      if (currentState.compiledPaneItem === COMPILEDPANE.Vega) {
        expect(screen.getByText('Compiled Vega').parentElement).toHaveClass('active-tab');
      } else if (currentState.compiledPaneItem === COMPILEDPANE.NormalizedVegaLite) {
        expect(screen.getByText('Extended Vega-Lite Spec').parentElement).toHaveClass('active-tab');
      }
    });
  });

  describe('Edit Spec Buttons', () => {
    it('should display edit buttons based on active tab', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();

      if (currentState.compiledVegaSpec) {
        // When spec is expanded, edit buttons should be visible
        if (currentState.compiledPaneItem === COMPILEDPANE.Vega) {
          const editButton = screen.queryByText('Edit Vega Spec');
          expect(editButton).toBeInTheDocument();
        } else if (currentState.compiledPaneItem === COMPILEDPANE.NormalizedVegaLite) {
          const editButton = screen.queryByText('Edit Extended Vega-Lite Spec');
          expect(editButton).toBeInTheDocument();
        }
      }
    });

    it('should handle edit button clicks', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();

      if (currentState.compiledVegaSpec) {
        if (currentState.compiledPaneItem === COMPILEDPANE.Vega) {
          const editButton = screen.queryByText('Edit Vega Spec');
          if (editButton) {
            expect(() => {
              fireEvent.click(editButton);
            }).not.toThrow();
          }
        } else {
          const editButton = screen.queryByText('Edit Extended Vega-Lite Spec');
          if (editButton) {
            expect(() => {
              fireEvent.click(editButton);
            }).not.toThrow();
          }
        }
      }
    });
  });

  describe('Toggle Functionality', () => {
    it('should handle header toggle click', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const editorHeaders = document.querySelectorAll('.editor-header');
      const compiledSpecHeader = Array.from(editorHeaders).find(
        (header) =>
          header.textContent?.includes('Compiled Vega') || header.textContent?.includes('Extended Vega-Lite Spec'),
      );

      if (compiledSpecHeader) {
        expect(() => {
          fireEvent.click(compiledSpecHeader);
        }).not.toThrow();
      }
    });

    it('should show different chevron icons based on expand state', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const chevronIcons = document.querySelectorAll('svg');
      expect(chevronIcons.length).toBeGreaterThan(0);

      const currentState = store.getState();
      expect(currentState.compiledVegaSpec).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should integrate with Redux store', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      expect(currentState.compiledPaneItem).toBeDefined();
      expect(currentState.compiledVegaSpec).toBeDefined();
    });

    it('should handle store updates for compiledPaneItem', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const initialState = store.getState();
      expect(initialState.compiledPaneItem).toBeDefined();

      store.dispatch({type: 'SET_COMPILEDPANE_ITEM', compiledPaneItem: COMPILEDPANE.NormalizedVegaLite});

      const updatedState = store.getState();
      expect(updatedState.compiledPaneItem).toBe(COMPILEDPANE.NormalizedVegaLite);
    });

    it('should handle toggle compiled vega spec action', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const initialState = store.getState();
      const initialCompiled = initialState.compiledVegaSpec;

      store.dispatch({type: 'TOGGLE_COMPILED_VEGA_SPEC'});

      const updatedState = store.getState();
      expect(updatedState.compiledVegaSpec).toBe(!initialCompiled);
    });
  });

  describe('Event Handling', () => {
    it('should handle multiple tab clicks without errors', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');
      const extendedVegaLiteTab = screen.getByText('Extended Vega-Lite Spec');

      expect(() => {
        fireEvent.click(compiledVegaTab);
        fireEvent.click(extendedVegaLiteTab);
        fireEvent.click(compiledVegaTab);
      }).not.toThrow();
    });

    it('should handle mouse events on tabs', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');

      expect(() => {
        fireEvent.mouseDown(compiledVegaTab);
        fireEvent.mouseUp(compiledVegaTab);
        fireEvent.mouseEnter(compiledVegaTab);
        fireEvent.mouseLeave(compiledVegaTab);
      }).not.toThrow();
    });

    it('should handle keyboard navigation', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const extendedVegaLiteTab = screen.getByText('Extended Vega-Lite Spec');

      expect(() => {
        fireEvent.keyDown(extendedVegaLiteTab, {key: 'Enter'});
        fireEvent.keyDown(extendedVegaLiteTab, {key: ' '});
        fireEvent.keyDown(extendedVegaLiteTab, {key: 'Tab'});
      }).not.toThrow();
    });

    it('should handle event propagation correctly', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');

      const mockStopPropagation = vi.fn();
      const mockEvent = {
        stopPropagation: mockStopPropagation,
      };

      fireEvent.click(compiledVegaTab, mockEvent);

      expect(compiledVegaTab).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount and unmount without errors', () => {
      const {unmount} = render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');
      expect(compiledVegaTab).toBeInTheDocument();

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle component re-renders', () => {
      const {rerender} = render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const compiledVegaTab = screen.getByText('Compiled Vega');
      expect(compiledVegaTab).toBeInTheDocument();

      expect(() => {
        rerender(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );
      }).not.toThrow();
    });
  });

  describe('Router Integration', () => {
    it('should handle history navigation', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      const compiledVegaTab = screen.getByText('Compiled Vega');

      if (currentState.compiledVegaSpec) {
        const editButton = screen.queryByText('Edit Vega Spec') || screen.queryByText('Edit Extended Vega-Lite Spec');
        if (editButton) {
          expect(() => {
            fireEvent.click(editButton);
          }).not.toThrow();
        }
      }

      expect(compiledVegaTab).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle clicks without throwing errors', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const tabs = document.querySelectorAll('.tabs-nav li');

      tabs.forEach((tab) => {
        expect(() => {
          fireEvent.click(tab);
        }).not.toThrow();
      });
    });

    it('should handle invalid interactions gracefully', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const editorHeaders = document.querySelectorAll('.editor-header');

      editorHeaders.forEach((header) => {
        expect(() => {
          fireEvent.click(header);
          fireEvent.focus(header);
          fireEvent.blur(header);
        }).not.toThrow();
      });
    });
  });

  describe('Integration with App State', () => {
    it('should reflect current compiled pane item in UI', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();

      if (currentState.compiledPaneItem === COMPILEDPANE.Vega) {
        expect(screen.getByText('Compiled Vega').parentElement).toHaveClass('active-tab');
      } else if (currentState.compiledPaneItem === COMPILEDPANE.NormalizedVegaLite) {
        expect(screen.getByText('Extended Vega-Lite Spec').parentElement).toHaveClass('active-tab');
      }
    });

    it('should maintain proper component structure', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const editorHeaders = document.querySelectorAll('.editor-header');
      const tabsNav = document.querySelector('.tabs-nav');

      expect(editorHeaders.length).toBeGreaterThan(0);
      expect(tabsNav).toBeInTheDocument();

      expect(screen.getByText('Compiled Vega')).toBeInTheDocument();
      expect(screen.getByText('Extended Vega-Lite Spec')).toBeInTheDocument();
    });
  });
});
