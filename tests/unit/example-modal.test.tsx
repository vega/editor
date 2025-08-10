import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import AppShell from '../../src/components/app-shell';

describe('Example Modal Component', () => {
  it('should render the modal', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
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
