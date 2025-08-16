import {screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {renderApp} from '../setup';

const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
    localStorage.clear();
  });

  describe('Basic UI Elements', () => {
    it('should render all main header buttons and elements', () => {
      renderApp();

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
      renderApp();

      const header = document.querySelector('.app-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveAttribute('role', 'banner');

      const leftSection = document.querySelector('.left-section');
      const rightSection = document.querySelector('.right-section');
      expect(leftSection).toBeInTheDocument();
      expect(rightSection).toBeInTheDocument();
    });

    describe('Mode Switcher Interactions', () => {
      it('should show Vega option when clicking Vega-Lite dropdown and allow mode switch', async () => {
        renderApp();

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

    describe('Auto Parse Toggle Interactions', () => {
      it('should toggle parse mode when auto-run dropdown is changed', async () => {
        renderApp();

        // Initially Auto
        expect(screen.getByText('Run')).toBeInTheDocument();
        expect(screen.getByText('Auto')).toBeInTheDocument();

        const control = document.querySelector('.auto-run-wrapper .auto-run__control');
        expect(control).toBeInTheDocument();

        // Open and choose Manual
        fireEvent.mouseDown(control!);
        const manualOption = await screen.findByText('Manual');
        fireEvent.click(manualOption);

        // Parse mode label updates to Manual
        await waitFor(() => expect(screen.getByText('Manual')).toBeInTheDocument());

        // Open again and choose Auto to toggle back
        const control2 = document.querySelector('.auto-run-wrapper .auto-run__control');
        fireEvent.mouseDown(control2!);
        const autoOption = await screen.findByText('Auto');
        fireEvent.click(autoOption);

        await waitFor(() => expect(screen.getByText('Auto')).toBeInTheDocument());
      });
    });

    describe('Modal Button Interactions', () => {
      it('should open export modal when export button is clicked', async () => {
        renderApp();

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
        renderApp();

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
        renderApp();

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
        renderApp();

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

        // Determine current mode from persisted $schema in localStorage state
        const persisted = localStorage.getItem('state');
        const parsed = persisted ? JSON.parse(persisted) : {};
        const schema = parsed.editorString || '';
        const isVega = typeof schema === 'string' && schema.includes('/vega/v');
        if (isVega) {
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
        renderApp();

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
        const userData = {login: 'john', name: 'John Appleseed', avatar_url: 'https://example.com/avatar.jpg'};
        const token = btoa(JSON.stringify({data: JSON.stringify(userData)}));
        localStorage.setItem(
          'vega_editor_auth_data',
          JSON.stringify({
            isAuthenticated: true,
            handle: 'john',
            name: 'John Appleseed',
            profilePicUrl: 'https://example.com/avatar.jpg',
            authToken: token,
          }),
        );
        localStorage.setItem('vega_editor_auth_token', token);

        renderApp();

        await waitFor(() => {
          const img = document.querySelector('.profile-img');
          expect(img).toBeInTheDocument();
        });

        const profileImg = document.querySelector('.profile-img');

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
        renderApp();

        const parseMode = document.querySelector('.parse-mode');
        expect(parseMode).toBeInTheDocument();
        expect(parseMode).toHaveClass('parse-mode');

        expect(parseMode).toHaveTextContent('Auto');
      });

      it('should handle button hover states', () => {
        renderApp();

        const headerButton = document.querySelector('.header-button');
        expect(headerButton).toBeInTheDocument();

        fireEvent.mouseEnter(headerButton!);
        expect(headerButton).toHaveClass('header-button');
      });
    });

    describe('Error Handling', () => {
      it('should handle clicks without throwing errors', () => {
        renderApp();

        const buttons = document.querySelectorAll('.header-button');

        buttons.forEach((button) => {
          expect(() => {
            fireEvent.click(button);
          }).not.toThrow();
        });
      });

      it('should handle modal interactions without errors', () => {
        renderApp();

        // Not clicking 'Gist' to prevent async issues
        const modalTriggers = ['Export', 'Share', 'Examples', 'Help'];

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
