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

    const examplesButton = screen.getByText('Examples');
    fireEvent.click(examplesButton);

    const modalBody = document.querySelector('.modal-body');
    expect(modalBody).toBeInTheDocument();

    const buttonGroups = document.querySelector('.button-groups');
    expect(buttonGroups).toBeInTheDocument();
    const vegaButton = buttonGroups?.querySelector('button:first-child');
    expect(vegaButton).toHaveTextContent('Vega');
    const vegaLiteButton = buttonGroups?.querySelector('button:last-child');
    expect(vegaLiteButton).toHaveTextContent('Vega-Lite');

    const itemGroup = document.querySelector('.item-group');
    expect(itemGroup).toBeInTheDocument();

    const item = document.querySelector('.item');
    expect(item).toBeInTheDocument();

    const simpleBarChart = screen.getByText('Simple Bar Chart');
    expect(simpleBarChart).toBeInTheDocument();

    const horizontalStackedBarChart = screen.getByText('Horizontal Stacked Bar Chart');
    expect(horizontalStackedBarChart).toBeInTheDocument();
    expect(horizontalStackedBarChart).toBeInTheDocument();

    const barChartWithLabels = screen.getByText('Bar Chart with Labels');
    expect(barChartWithLabels).toBeInTheDocument();
  });
});
