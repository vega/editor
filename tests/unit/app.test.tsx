import React from 'react';
import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import configureStore from '../../src/store/configure-store';
import App from '../../src/components/app';

const store = configureStore();

describe('App Component', () => {
  it('should render main app element', () => {
    render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    expect(screen.getByText('Vega-Lite')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const {container} = render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
