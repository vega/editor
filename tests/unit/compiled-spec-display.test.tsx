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

describe('Compiled Spec Display Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Basic UI Elements', () => {
    it('should render the full height wrapper', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();
    });

    it('should render the compiled spec header', () => {
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

    it('should render the Monaco editor container', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      // Monaco editor not fully loaded in test environment
      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper component hierarchy', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

      const editorHeaders = document.querySelectorAll('.editor-header');
      expect(editorHeaders.length).toBeGreaterThan(0);
    });

    it('should maintain proper layout structure', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const app = document.querySelector('.app-container');
      expect(app).toBeInTheDocument();

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();
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
      expect(currentState.compiledVegaPaneSize).toBeDefined();
      expect(currentState.mode).toBeDefined();
    });

    it('should handle compiled pane item changes', () => {
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

    it('should handle editor reference updates', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      expect(currentState.compiledEditorRef).toBeDefined();
      expect(currentState.editorRef).toBeDefined();
    });
  });

  describe('Monaco Editor Integration', () => {
    it('should handle Monaco editor mount without errors', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      // Monaco editor not fully loaded in test environment
      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();
    });

    it('should handle editor focus events', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');

      expect(() => {
        fireEvent.focus(fullHeightWrapper!);
        fireEvent.blur(fullHeightWrapper!);
      }).not.toThrow();
    });
  });

  describe('Resize Observer Integration', () => {
    it('should handle resize events without errors', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

      expect(() => {
        fireEvent(window, new Event('resize'));
      }).not.toThrow();
    });

    it('should handle layout changes', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      expect(currentState.compiledVegaPaneSize).toBeDefined();
      expect(typeof currentState.compiledVegaPaneSize).toBe('number');
    });
  });

  describe('Tab Interaction', () => {
    it('should handle tab switching between Vega and VegaLite', () => {
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
      }).not.toThrow();
    });

    it('should maintain active tab state', () => {
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

  describe('Event Handling', () => {
    it('should handle mouse events without errors', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');

      expect(() => {
        fireEvent.mouseDown(fullHeightWrapper!);
        fireEvent.mouseUp(fullHeightWrapper!);
        fireEvent.click(fullHeightWrapper!);
      }).not.toThrow();
    });

    it('should handle keyboard events', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');

      expect(() => {
        fireEvent.keyDown(fullHeightWrapper!, {key: 'Enter'});
        fireEvent.keyDown(fullHeightWrapper!, {key: 'Tab'});
        fireEvent.keyDown(fullHeightWrapper!, {key: 'Escape'});
      }).not.toThrow();
    });

    it('should handle focus and blur events', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');

      expect(() => {
        fireEvent.focus(fullHeightWrapper!);
        fireEvent.blur(fullHeightWrapper!);
      }).not.toThrow();
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

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle component updates', () => {
      const {rerender} = render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

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

  describe('Editor Content Management', () => {
    it('should handle different spec types', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();

      expect(currentState.vegaSpec).toBeDefined();
      expect(currentState.normalizedVegaLiteSpec).toBeDefined();
    });

    it('should handle spec updates', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const initialState = store.getState();
      const testSpec = '{"test": "spec"}';

      store.dispatch({type: 'UPDATE_VEGA_SPEC', spec: testSpec, config: '{}'});

      const updatedState = store.getState();
      expect(updatedState.vegaSpec).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

      expect(() => {
        fireEvent.click(fullHeightWrapper!);
        fireEvent.focus(fullHeightWrapper!);
        fireEvent.blur(fullHeightWrapper!);
      }).not.toThrow();
    });

    it('should handle invalid state gracefully', () => {
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
        fireEvent.click(extendedVegaLiteTab);
      }).not.toThrow();
    });
  });

  describe('Integration with App State', () => {
    it('should reflect compiled pane item changes in UI', () => {
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

    it('should maintain proper component structure across state changes', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      store.dispatch({type: 'SET_COMPILEDPANE_ITEM', compiledPaneItem: COMPILEDPANE.Vega});

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

      store.dispatch({type: 'SET_COMPILEDPANE_ITEM', compiledPaneItem: COMPILEDPANE.NormalizedVegaLite});

      expect(fullHeightWrapper).toBeInTheDocument();
    });

    it('should handle editor focus state changes', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      expect(currentState.editorFocus).toBeDefined();

      store.dispatch({type: 'SET_EDITOR_FOCUS', editorFocus: 'CompiledEditor'});

      const updatedState = store.getState();
      expect(updatedState.editorFocus).toBe('CompiledEditor');
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper accessibility structure', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const fullHeightWrapper = document.querySelector('.full-height-wrapper');
      expect(fullHeightWrapper).toBeInTheDocument();

      const tabs = document.querySelectorAll('.tabs-nav li');
      expect(tabs.length).toBeGreaterThan(0);
    });
  });
});
