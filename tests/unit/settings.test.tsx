import {fireEvent, screen, waitFor} from '@testing-library/react';
import {renderApp} from '../setup';

describe('Settings Component', () => {
  it('should toggle settings pane when clicked', () => {
    renderApp();
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton!);
    const settingsPane = document.querySelector('.settings');
    expect(settingsPane).toBeInTheDocument();

    expect(screen.getByText('Renderer:')).toBeInTheDocument();
    expect(screen.getByText('Background Color:')).toBeInTheDocument();
    expect(screen.getByText('Log Level:')).toBeInTheDocument();
    expect(screen.getByText('Hover:')).toBeInTheDocument();
    expect(screen.getByText('Tooltips')).toBeInTheDocument();

    // Close the pane on second click
    fireEvent.click(settingsButton);
    expect(document.querySelector('.settings')).toBeNull();
  });

  it('should handle dropdowns correctly', async () => {
    renderApp();
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton!);

    const logDropdown = document.querySelector('.log-level-dropdown__control');
    expect(logDropdown).toBeInTheDocument();
    // react-select opens on mouseDown
    fireEvent.mouseDown(logDropdown! as Element);

    await waitFor(() => {
      expect(document.querySelector('.log-level-dropdown__menu-list')).toBeInTheDocument();
    });

    const logOptions = document.querySelectorAll('.log-level-dropdown__option');
    expect(logOptions).toHaveLength(5);
    expect(logOptions[0]).toHaveTextContent('None');
    expect(logOptions[1]).toHaveTextContent('Error');
    expect(logOptions[2]).toHaveTextContent('Warn');
    expect(logOptions[3]).toHaveTextContent('Info');
    expect(logOptions[4]).toHaveTextContent('Debug');

    const hoverDropdown = document.querySelector('.hover-enable-dropdown__control');
    expect(hoverDropdown).toBeInTheDocument();
    fireEvent.mouseDown(hoverDropdown! as Element);

    await waitFor(() => {
      expect(document.querySelector('.hover-enable-dropdown__menu-list')).toBeInTheDocument();
    });

    const hoverOptions = document.querySelectorAll('.hover-enable-dropdown__option');
    expect(hoverOptions).toHaveLength(3);
    expect(hoverOptions[0]).toHaveTextContent('Auto');
    expect(hoverOptions[1]).toHaveTextContent('On');
    expect(hoverOptions[2]).toHaveTextContent('Off');
  });

  it('should handle radio buttons correctly', () => {
    renderApp();
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton!);

    const svgRadio = screen.getByLabelText('SVG') as HTMLInputElement;
    const canvasRadio = screen.getByLabelText('Canvas') as HTMLInputElement;

    expect(svgRadio).toBeInTheDocument();
    expect(canvasRadio).toBeInTheDocument();

    // default renderer is svg
    expect(svgRadio).toBeChecked();
    expect(canvasRadio).not.toBeChecked();

    // switch to canvas
    fireEvent.click(canvasRadio);
    expect(canvasRadio).toBeChecked();
    expect(svgRadio).not.toBeChecked();
  });

  it('should render background color picker', () => {
    renderApp();
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton!);
    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement | null;
    expect(colorInput).toBeInTheDocument();
    expect(colorInput!.value.toLowerCase()).toBe('#ffffff');
  });
});
