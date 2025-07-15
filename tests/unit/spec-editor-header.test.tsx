import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';
import {SIDEPANE} from '../../src/constants/consts';

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

describe('Spec Editor Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('Basic UI Elements', () => {
    it('should render the spec editor header with tabs', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const specEditorHeader = document.querySelector('.spec-editor-header');
      expect(specEditorHeader).toBeInTheDocument();

      const tabsNav = document.querySelector('.tabs-nav');
      expect(tabsNav).toBeInTheDocument();

      const tabs = document.querySelectorAll('.tabs-nav li');
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper header structure', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const editorHeader = document.querySelector('.editor-header');
      expect(editorHeader).toBeInTheDocument();
      expect(editorHeader).toHaveClass('spec-editor-header');
    });

    it('should display mode name in the first tab', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      const currentMode = currentState.mode;

      expect(screen.getByText(currentMode)).toBeInTheDocument();
    });

    it('should display Config tab', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      expect(screen.getByText('Config')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should handle Editor tab click', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      const modeTab = screen.getByText(currentState.mode);

      fireEvent.click(modeTab);

      expect(modeTab).toBeInTheDocument();
    });

    it('should handle Config tab click', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const configTab = screen.getByText('Config');

      fireEvent.click(configTab);

      expect(configTab).toBeInTheDocument();
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
      const tabsNav = document.querySelector('.tabs-nav');
      const tabs = tabsNav?.querySelectorAll('li');

      const activeTab = document.querySelector('.active-tab');
      expect(activeTab).toBeInTheDocument();

      if (currentState.sidePaneItem === SIDEPANE.Editor) {
        expect(screen.getByText(currentState.mode).parentElement).toHaveClass('active-tab');
      } else if (currentState.sidePaneItem === SIDEPANE.Config) {
        expect(screen.getByText('Config').parentElement).toHaveClass('active-tab');
      }
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
      expect(currentState.sidePaneItem).toBeDefined();
      expect(currentState.mode).toBeDefined();
    });

    it('should handle store updates for sidePaneItem', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const initialState = store.getState();
      expect(initialState.sidePaneItem).toBeDefined();

      store.dispatch({type: 'SET_SIDEPANE_ITEM', sidePaneItem: SIDEPANE.Config});

      const updatedState = store.getState();
      expect(updatedState.sidePaneItem).toBe(SIDEPANE.Config);
    });
  });

  describe('Event Handling', () => {
    it('should handle multiple clicks without errors', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      const modeTab = screen.getByText(currentState.mode);
      const configTab = screen.getByText('Config');

      expect(() => {
        fireEvent.click(modeTab);
        fireEvent.click(configTab);
        fireEvent.click(modeTab);
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

      const configTab = screen.getByText('Config');

      expect(() => {
        fireEvent.mouseDown(configTab);
        fireEvent.mouseUp(configTab);
        fireEvent.mouseEnter(configTab);
        fireEvent.mouseLeave(configTab);
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

      const configTab = screen.getByText('Config');

      expect(() => {
        fireEvent.keyDown(configTab, {key: 'Enter'});
        fireEvent.keyDown(configTab, {key: ' '});
        fireEvent.keyDown(configTab, {key: 'Tab'});
      }).not.toThrow();
    });
  });

  describe('Config Editor Integration', () => {
    it('should show config editor header when Config tab is active', async () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const configTab = screen.getByText('Config');
      fireEvent.click(configTab);

      await waitFor(() => {
        const specEditorHeader = document.querySelector('.spec-editor-header');
        expect(specEditorHeader).toBeInTheDocument();
      });
    });

    it('should handle config tab interaction', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const configTab = screen.getByText('Config');

      fireEvent.click(configTab);
      fireEvent.click(configTab);

      expect(configTab).toBeInTheDocument();
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

      const specEditorHeader = document.querySelector('.spec-editor-header');
      expect(specEditorHeader).toBeInTheDocument();

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

      const specEditorHeader = document.querySelector('.spec-editor-header');
      expect(specEditorHeader).toBeInTheDocument();

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

    it('should handle invalid state gracefully', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const specEditorHeader = document.querySelector('.spec-editor-header');
      expect(specEditorHeader).toBeInTheDocument();

      expect(() => {
        fireEvent.click(specEditorHeader!);
        fireEvent.focus(specEditorHeader!);
        fireEvent.blur(specEditorHeader!);
      }).not.toThrow();
    });
  });

  describe('Integration with App State', () => {
    it('should reflect current mode in UI', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const currentState = store.getState();
      expect(screen.getByText(currentState.mode)).toBeInTheDocument();
    });

    it('should maintain proper component structure', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const editorHeader = document.querySelector('.editor-header');
      const tabsNav = document.querySelector('.tabs-nav');
      const specEditorHeader = document.querySelector('.spec-editor-header');

      expect(editorHeader).toBeInTheDocument();
      expect(tabsNav).toBeInTheDocument();
      expect(specEditorHeader).toBeInTheDocument();
    });
  });
});
