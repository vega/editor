import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import AppShell from '../../src/components/app-shell';

describe('Share Modal Component', () => {
  it('should render the share modal', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    // click on share button
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);

    // expect to see the modal
    const modalBody = document.querySelector('.modal-body');
    expect(modalBody).toBeInTheDocument();

    // expect 3 buttons
    const buttons = modalBody?.querySelectorAll('button');
    expect(buttons).toHaveLength(3);

    // expect 3 buttons to have the correct text
    expect(buttons?.[0]).toHaveTextContent('Open Link');
    expect(buttons?.[1]).toHaveTextContent('Copy Link to Clipboard');
    expect(buttons?.[2]).toHaveTextContent('Copy Markdown Link to Clipboard');

    // expect to see 2 links <a>
    const links = modalBody?.querySelectorAll('a');
    expect(links).toHaveLength(2);

    // expect to see 2 links <a> to have the correct text
    expect(links?.[0]).toHaveTextContent('GitHub Gist');
    expect(links?.[1]).toHaveTextContent('Login with GitHub');
  });
});
