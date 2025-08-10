import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import App from '../../src/components/app';
import {Mode} from '../../src/constants/consts';
import AppShell from '../../src/components/app-shell';

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

const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

describe('Spec Editor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockConfirm.mockClear();
  });

  describe('Basic UI Elements', () => {
    it('should render the input panel container', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      const appContainer = document.querySelector('.app-container');
      expect(appContainer).toBeInTheDocument();
    });

    it('should render editor with proper structure', async () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const mainPanel = document.querySelector('.main-panel');
      expect(mainPanel).toBeInTheDocument();

      const splitPane = document.querySelector('.main-pane');
      expect(splitPane).toBeInTheDocument();
    });

    it('should have proper app structure configured', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const appContainer = document.querySelector('.app-container');
      expect(appContainer).toBeInTheDocument();

      expect(appContainer).toHaveClass('app-container');
    });
  });

  describe('Editor Interaction', () => {
    it('should handle focus events on input panel', async () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      fireEvent.focus(inputPanel!);

      expect(inputPanel).toBeInTheDocument();
    });

    it('should handle blur events on input panel', async () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      fireEvent.blur(inputPanel!);

      expect(inputPanel).toBeInTheDocument();
    });

    it('should handle mouse events on input panel', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      fireEvent.mouseDown(inputPanel!);
      fireEvent.mouseUp(inputPanel!);
      fireEvent.click(inputPanel!);

      expect(inputPanel).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle keyboard events without errors', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      fireEvent.keyDown(document, {key: 'b', ctrlKey: true});
      fireEvent.keyDown(document, {key: 's', ctrlKey: true});
      fireEvent.keyDown(document, {key: 'b', metaKey: true});
      fireEvent.keyDown(document, {key: 's', metaKey: true});

      expect(() => {
        fireEvent.keyDown(document, {key: 'Enter'});
      }).not.toThrow();
    });

    it('should handle regular key presses', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      fireEvent.keyDown(document, {key: 'a'});
      fireEvent.keyDown(document, {key: 'Enter'});
      fireEvent.keyDown(document, {key: 'Escape'});

      expect(() => {
        fireEvent.keyDown(document, {key: 'Tab'});
      }).not.toThrow();
    });
  });

  describe('Context Menu Actions', () => {
    it('should handle context menu interactions', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      fireEvent.contextMenu(inputPanel!);

      expect(inputPanel).toBeInTheDocument();
    });

    it('should handle right-click events on input panel', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      fireEvent.mouseDown(inputPanel!, {button: 2});
      fireEvent.mouseUp(inputPanel!, {button: 2});

      expect(inputPanel).toBeInTheDocument();
    });
  });

  describe('Editor Content Management', () => {
    it('should handle content updates without crashing', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      expect(() => {
        fireEvent.click(inputPanel!);
        fireEvent.focus(inputPanel!);
        fireEvent.blur(inputPanel!);
      }).not.toThrow();
    });

    it('should handle user interactions gracefully', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      expect(() => {
        fireEvent.mouseDown(inputPanel!);
        fireEvent.mouseUp(inputPanel!);
        fireEvent.keyDown(inputPanel!, {key: 'Enter'});
      }).not.toThrow();
    });
  });

  describe('Mode Switching', () => {
    it('should handle mode changes properly', async () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      const modeSwitcher = document.querySelector('.mode-switcher-wrapper');
      if (modeSwitcher) {
        const control = modeSwitcher.querySelector('.mode-switcher__control');
        if (control) {
          fireEvent.mouseDown(control);

          await waitFor(() => {
            const vegaOption = screen.queryByText('Vega');
            if (vegaOption) {
              fireEvent.click(vegaOption);
            }
          });
        }
      }

      expect(inputPanel).toBeInTheDocument();
    });
  });

  describe('URL Parameter Handling', () => {
    it('should handle URL changes without errors', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      // Triggering URL param handling
      fireEvent(window, new Event('popstate'));

      expect(inputPanel).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should handle focus changes', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      // Testing blur cycles
      fireEvent.focus(inputPanel!);
      fireEvent.blur(inputPanel!);
      fireEvent.focus(inputPanel!);

      expect(inputPanel).toBeInTheDocument();
    });

    it('should handle tab navigation', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      fireEvent.keyDown(inputPanel!, {key: 'Tab'});
      fireEvent.keyDown(inputPanel!, {key: 'Tab', shiftKey: true});

      expect(inputPanel).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount and unmount without errors', () => {
      const {unmount} = render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      // Test unmounting
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle component updates', () => {
      const {rerender} = render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      // Test re-rendering
      expect(() => {
        rerender(
          <HashRouter>
            <AppContextProvider>
              <AppShell />
            </AppContextProvider>
          </HashRouter>,
        );
      }).not.toThrow();
    });
  });

  describe('Integration with App State', () => {
    it('should integrate properly with application state', () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      const currentState = store.getState();
      expect(currentState).toBeDefined();
      expect(currentState.editorString).toBeDefined();
    });

    it('should handle store updates', async () => {
      render(
        <HashRouter>
          <AppContextProvider>
            <AppShell />
          </AppContextProvider>
        </HashRouter>,
      );

      const inputPanel = document.querySelector('[role="group"][aria-label="spec editors"]');
      expect(inputPanel).toBeInTheDocument();

      // Get initial state
      const initialState = store.getState();
      expect(initialState.editorString).toBeDefined();

      const testSpec = '{"test": "spec"}';
      store.dispatch({type: 'UPDATE_EDITOR_STRING', editorString: testSpec});

      // Verify the store was updated
      const updatedState = store.getState();
      expect(updatedState.editorString).toBe(testSpec);

      expect(inputPanel).toBeInTheDocument();
    });
  });
});
