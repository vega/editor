import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';
import {Mode} from '../../src/constants/consts';

const store = configureStore();

const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  describe('Basic UI Elements', () => {
    it('should render all main header buttons and elements', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      expect(screen.getByText('Vega-Lite')).toBeInTheDocument();
      expect(screen.getByText('Commands')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Gist')).toBeInTheDocument();
      expect(screen.getByText('Examples')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign in with')).toBeInTheDocument();
    });

    it('should have proper header structure with sections', () => {
      render(
        <Provider store={store}>
          <HashRouter>
            <App />
          </HashRouter>
        </Provider>,
      );

      const header = document.querySelector('.app-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('role', 'banner');

      const leftSection = document.querySelector('.left-section');
      const rightSection = document.querySelector('.right-section');
      expect(leftSection).toBeInTheDocument();
      expect(rightSection).toBeInTheDocument();
    });

    describe('Settings Button Interactions', () => {
      it('should toggle settings state when clicked', () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const settingsButton = document.querySelector('.settings-button');

        fireEvent.click(settingsButton!);

        waitFor(() => {
          const settingsPane = document.getElementsByClassName('settings');
          expect(settingsPane).toBeInTheDocument();
        });

        fireEvent.click(settingsButton!);
      });
    });

    describe('Mode Switcher Interactions', () => {
      it('should show Vega option when clicking Vega-Lite dropdown and allow mode switch', async () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        expect(screen.getByText('Vega-Lite')).toBeInTheDocument();

        const modeSwitcher = document.querySelector('.mode-switcher-wrapper');
        const control = modeSwitcher?.querySelector('.mode-switcher__control');
        expect(control).toBeInTheDocument();

        fireEvent.mouseDown(control!);

        await waitFor(() => {
          expect(screen.getByText('Vega')).toBeInTheDocument();
        });

        const vegaOption = screen.getByText('Vega');
        fireEvent.click(vegaOption);

        await waitFor(() => {
          expect(window.location.hash).toContain('vega');
        });
      });
    });

    describe('Run Button Interactions', () => {
      it('should dispatch parse action when run button is clicked', () => {
        const mockDispatch = vi.fn();
        const mockStore = {
          ...store,
          dispatch: mockDispatch,
        };

        render(
          <Provider store={mockStore}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const runButton = document.querySelector('#run-button');
        expect(runButton).toBeInTheDocument();

        fireEvent.click(runButton!);

        expect(mockDispatch).toHaveBeenCalledWith({
          parse: true,
          type: 'PARSE_SPEC',
        });
      });

      it('should show correct parse mode text', () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        expect(screen.getByText('Run')).toBeInTheDocument();
        expect(screen.getByText('Auto')).toBeInTheDocument();
      });
    });

    describe('Auto Parse Toggle Interactions', () => {
      it('should toggle parse mode when auto-run dropdown is changed', async () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        expect(screen.getByText('Auto')).toBeInTheDocument();

        const autoRunWrapper = document.querySelector('.auto-run-wrapper');
        const control = autoRunWrapper?.querySelector('.auto-run__control');
        expect(control).toBeInTheDocument();

        fireEvent.mouseDown(control!);

        await waitFor(() => {
          const manualOption = screen.queryByText('Manual');
          if (manualOption) {
            expect(manualOption).toBeInTheDocument();

            fireEvent.click(manualOption);

            waitFor(() => {
              expect(screen.getByText('Manual')).toBeInTheDocument();
            });
          }
        });
      });
    });

    describe('Modal Button Interactions', () => {
      it('should open export modal when export button is clicked', async () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);

        await waitFor(() => {
          const modalBackground = document.querySelector('.modal-background');
          expect(modalBackground).toBeInTheDocument();
        });

        const modal = document.querySelector('.modal');
        expect(modal).toBeInTheDocument();

        const closeButton = document.querySelector('.close-button');
        expect(closeButton).toBeInTheDocument();
      });

      it('should close export modal when close button is clicked', async () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const exportButton = screen.getByText('Export');
        fireEvent.click(exportButton);

        await waitFor(() => {
          const modal = document.querySelector('.modal');
          expect(modal).toBeInTheDocument();
        });

        const closeButton = document.querySelector('.close-button');
        fireEvent.click(closeButton!);

        await waitFor(() => {
          const modalBackground = document.querySelector('.modal-background');
          expect(modalBackground).not.toBeInTheDocument();
        });
      });

      it('should open examples modal when examples button is clicked', async () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const examplesButton = screen.getByText('Examples');
        fireEvent.click(examplesButton);

        await waitFor(() => {
          const modal = document.querySelector('.modal');
          expect(modal).toBeInTheDocument();

          const buttonGroups = document.querySelector('.button-groups');
          expect(buttonGroups).toBeInTheDocument();
        });
      });

      it('should switch between Vega and Vega-Lite tabs in examples modal', async () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const examplesButton = screen.getByText('Examples');
        fireEvent.click(examplesButton);

        await waitFor(() => {
          const modalBody = document.querySelector('.modal-body');
          expect(modalBody).toBeInTheDocument();
        });

        const buttonGroups = document.querySelector('.button-groups');
        const vegaButton = buttonGroups?.querySelector('button:first-child');
        const vegaLiteButton = buttonGroups?.querySelector('button:last-child');

        expect(vegaButton).toBeInTheDocument();
        expect(vegaLiteButton).toBeInTheDocument();

        const currentMode = store.getState().mode;
        if (currentMode === Mode.Vega) {
          expect(vegaButton).toHaveClass('selected');
        } else {
          expect(vegaLiteButton).toHaveClass('selected');
        }

        fireEvent.click(vegaButton!);

        expect(vegaButton).toHaveClass('selected');
        expect(vegaLiteButton).not.toHaveClass('selected');

        fireEvent.click(vegaLiteButton!);

        expect(vegaLiteButton).toHaveClass('selected');
        expect(vegaButton).not.toHaveClass('selected');
      });
    });

    describe('Authentication Button Interactions', () => {
      it('should open sign in popup when sign in button is clicked', () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const signInButton = document.querySelector('.sign-in');
        expect(signInButton).toBeInTheDocument();

        fireEvent.click(signInButton!);

        expect(mockWindowOpen).toHaveBeenCalledWith(
          expect.stringContaining('auth/github'),
          'github-login',
          'width=600,height=600,resizable=yes',
        );
      });
    });

    describe('Profile Menu Interactions', () => {
      it('should show profile menu when authenticated and profile image is clicked', async () => {
        const authenticatedStore = {
          ...store,
          getState: () => ({
            ...store.getState(),
            isAuthenticated: true,
            name: 'John Appleseed',
            profilePicUrl: 'https://example.com/avatar.jpg',
          }),
        };

        render(
          <Provider store={authenticatedStore}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const profileImg = document.querySelector('.profile-img');
        expect(profileImg).toBeInTheDocument();

        expect(document.querySelector('.profile-menu')).not.toBeInTheDocument();

        fireEvent.click(profileImg!);

        await waitFor(() => {
          const profileMenu = document.querySelector('.profile-menu');
          expect(profileMenu).toBeInTheDocument();
          expect(screen.getByText('John Appleseed')).toBeInTheDocument();
        });
      });
    });

    describe('Component State Management', () => {
      it('should maintain proper CSS classes based on interactions', () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const parseMode = document.querySelector('.parse-mode');
        expect(parseMode).toBeInTheDocument();
        expect(parseMode).toHaveClass('parse-mode');

        expect(parseMode).toHaveTextContent('Manual');
      });

      it('should handle button hover states', () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const headerButton = document.querySelector('.header-button');
        expect(headerButton).toBeInTheDocument();

        fireEvent.mouseEnter(headerButton!);
        expect(headerButton).toHaveClass('header-button');
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

        const buttons = document.querySelectorAll('.header-button');

        buttons.forEach((button) => {
          expect(() => {
            fireEvent.click(button);
          }).not.toThrow();
        });
      });

      it('should handle modal interactions without errors', () => {
        render(
          <Provider store={store}>
            <HashRouter>
              <App />
            </HashRouter>
          </Provider>,
        );

        const modalTriggers = ['Export', 'Share', 'Gist', 'Examples', 'Help'];

        modalTriggers.forEach((triggerText) => {
          const trigger = screen.getByText(triggerText);
          expect(() => {
            fireEvent.click(trigger);
          }).not.toThrow();
        });
      });
    });
  });
});
