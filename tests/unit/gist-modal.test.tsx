import {screen, fireEvent} from '@testing-library/react';

import {renderApp} from '../setup';

describe('Gist Modal Component', () => {
  it('should render the modal with required elements', () => {
    renderApp();

    const gistButton = screen.getByText('Gist');
    fireEvent.click(gistButton);

    // Check that the modal is visible
    const modal = document.querySelector('.modal');
    expect(modal).toBeInTheDocument();

    // Check for the main gist URL input
    const urlInput = document.querySelector('input[placeholder="Enter URL"]');
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveAttribute('required');

    // Check for optional inputs
    const revisionInput = document.querySelector('input[placeholder="Enter revision"]');
    expect(revisionInput).toBeInTheDocument();

    const filenameInput = document.querySelector('input[placeholder="Enter filename"]');
    expect(filenameInput).toBeInTheDocument();

    // Check for links to GitHub
    const githubLinks = modal?.querySelectorAll('a[href*="github.com"]');
    expect(githubLinks?.length).toBeGreaterThan(0);
  });
});
