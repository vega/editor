import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';

const store = configureStore();
describe('Example Modal Component', () => {
  it('should render the modal', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );
    // expect to see 3 links <a> tags
    const gistButton = screen.getByText('Gist');
    fireEvent.click(gistButton);
    const modalBody = document.querySelector('.modal-body');
    expect(modalBody).toBeInTheDocument();

    const links = modalBody?.querySelectorAll('a');
    expect(links).toHaveLength(3);

    const loadButton = modalBody?.querySelector('button');
    expect(loadButton).toBeInTheDocument();
    expect(loadButton).toHaveTextContent('Load');
  });
});
