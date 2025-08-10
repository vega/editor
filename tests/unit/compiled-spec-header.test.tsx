// Check 'Compiled Vega' button and 'Extended Vega-Lite' button is present
// Test clicking on the buttons
// Test Edit Vega Spec and Edit Vega-Lite Spec buttons

import React from 'react';

import {HashRouter} from 'react-router-dom';
import {AppContextProvider} from '../../src/context/app-context';
import {fireEvent, render, screen} from '@testing-library/react';
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

    const editorHeader = document.querySelector('.editor-header:not(.spec-editor-header)');
    expect(editorHeader).toBeInTheDocument();
    if (editorHeader) {
      fireEvent.click(editorHeader);
    }

    const compiledVegaTab = screen.getByText('Compiled Vega');
    expect(compiledVegaTab).toBeInTheDocument();

    // Check that a button with the Text 'Edit Vega Spec' is present
    const editVegaSpecButton = screen.getByText('Edit Vega Spec');
    expect(editVegaSpecButton).toBeInTheDocument();

    const extendedVegaLiteTab = screen.getByText('Extended Vega-Lite Spec');
    expect(extendedVegaLiteTab).toBeInTheDocument();
    fireEvent.click(extendedVegaLiteTab);

    const editExtendedVegaLiteSpecButton = screen.getByText('Edit Extended Vega-Lite Spec');
    expect(editExtendedVegaLiteSpecButton).toBeInTheDocument();

    // Check the element with class 'active-tab' has text 'Extended Vega-Lite Spec'
    expect(editorHeader).toHaveTextContent('Extended Vega-Lite Spec');

    fireEvent.click(compiledVegaTab);
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
});
