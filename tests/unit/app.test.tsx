import {screen} from '@testing-library/react';
import {renderApp} from '../setup';

describe('App Component', () => {
  it('should render main app element', () => {
    renderApp();

    expect(screen.getByText('Vega-Lite')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const {container} = renderApp();

    expect(container.firstChild).toBeInTheDocument();
  });
});
