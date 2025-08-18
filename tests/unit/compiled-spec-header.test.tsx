// Check 'Compiled Vega' button and 'Extended Vega-Lite' button is present
// Test clicking on the buttons
// Test Edit Vega Spec and Edit Vega-Lite Spec buttons

import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import AppShell from '../../src/components/app-shell';

describe('Compiled Spec Header Component', () => {
  it('should render the compiled vega and extended vega-lite buttons', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    // Test that a component with the class 'tabs-nav' is present
    const tabsNav = document.querySelector('.tabs-nav');
    expect(tabsNav).toBeInTheDocument();

    // Test that the text 'Compiled Vega' and 'Extended Vega-Lite' is present using getByText
    const compiledVegaButton = screen.getByText('Compiled Vega');
    expect(compiledVegaButton).toBeInTheDocument();
    const extendedVegaLiteButton = screen.getByText('Extended Vega-Lite Spec');
    expect(extendedVegaLiteButton).toBeInTheDocument();
  });

  it('should handle tab switching and header click', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    const compiledVegaButton = screen.getByText('Compiled Vega');

    const editorHeader = document.querySelector('.editor-header:not(.spec-editor-header)');
    expect(editorHeader).toBeInTheDocument();
    if (editorHeader) {
      fireEvent.click(compiledVegaButton);
    }

    expect(editorHeader).not.toBeInTheDocument();

    // Check that the component with the class ="editor-header spec-editor-header" is present
    const specEditorHeader = document.querySelector('.editor-header.spec-editor-header');
    expect(specEditorHeader).toBeInTheDocument();
    //Check that the specEditorHeader has a ul element with the class 'tabs-nav' and that it has 2 li elements
    const tabsNav = specEditorHeader?.querySelector('ul.tabs-nav');
    expect(tabsNav).toBeInTheDocument();
    const tabsNavItems = tabsNav?.querySelectorAll('li');
    expect(tabsNavItems).toHaveLength(2);

    //Check that the first li element has the text 'VEGA'
    expect(tabsNavItems?.[0]).toHaveTextContent(/vega/i);
    //Check that the second li element has the text 'CONFIG'
    expect(tabsNavItems?.[1]).toHaveTextContent(/config/i);
  });

  it('should handle editing vega spec', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    const compiledVegaButton = screen.getByText('Compiled Vega');
    fireEvent.click(compiledVegaButton);

    const editorHeader = document.querySelector('.editor-header.spec-editor-header');
    expect(editorHeader).toBeInTheDocument();

    // Check that a button with the text 'Edit Vega Spec' is present
    const editVegaSpecButton = screen.getByText('Edit Vega Spec');
    expect(editVegaSpecButton).toBeInTheDocument();

    fireEvent.click(editVegaSpecButton);

    expect(editorHeader).not.toBeInTheDocument();

    // Check that the component with the class ="editor-header spec-editor-header" is present
    const specEditorHeader = document.querySelector('.editor-header.spec-editor-header');
    expect(specEditorHeader).toBeInTheDocument();
    //Check that the specEditorHeader has a ul element with the class 'tabs-nav' and that it has 2 li elements
    const tabsNav = specEditorHeader?.querySelector('ul.tabs-nav');
    expect(tabsNav).toBeInTheDocument();
    const tabsNavItems = tabsNav?.querySelectorAll('li');
    expect(tabsNavItems).toHaveLength(2);

    //Check that the first li element has the text 'VEGA'
    expect(tabsNavItems?.[0]).toHaveTextContent(/vega/i);
    //Check that the second li element has the text 'CONFIG'
    expect(tabsNavItems?.[1]).toHaveTextContent(/config/i);
  });

  it('should handle editing extended vega-lite spec', () => {
    render(
      <HashRouter>
        <AppContextProvider>
          <AppShell />
        </AppContextProvider>
      </HashRouter>,
    );
    const extendedVegaLiteButton = screen.getByText('Extended Vega-Lite Spec');
    expect(extendedVegaLiteButton).toBeInTheDocument();
    fireEvent.click(extendedVegaLiteButton);

    const editorHeader = document.querySelector('.editor-header.spec-editor-header');
    expect(editorHeader).toBeInTheDocument();

    const editExtendedVegaLiteSpecButton = screen.getByText('Edit Extended Vega-Lite Spec');
    expect(editExtendedVegaLiteSpecButton).toBeInTheDocument();

    fireEvent.click(editExtendedVegaLiteSpecButton);

    expect(editorHeader).toBeInTheDocument();

    const specEditorHeader = document.querySelector('.editor-header.spec-editor-header');
    expect(specEditorHeader).toBeInTheDocument();

    const tabsNav = specEditorHeader?.querySelector('ul.tabs-nav');
    expect(tabsNav).toBeInTheDocument();
    const tabsNavItems = tabsNav?.querySelectorAll('li');
    expect(tabsNavItems).toHaveLength(2);

    // First tab should reflect Vega-Lite mode; second should be Config
    expect(tabsNavItems?.[0]).toHaveTextContent(/vega-lite/i);
    expect(tabsNavItems?.[1]).toHaveTextContent(/config/i);
  });
});
