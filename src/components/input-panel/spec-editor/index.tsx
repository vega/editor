import * as React from 'react';
import * as EditorActions from '../../../actions/editor.js';
import {useAppDispatch, useAppSelector} from '../../../hooks.js';
import EditorWithNavigation from './renderer.js';

const SpecEditor = () => {
  const dispatch = useAppDispatch();

  const stateProps = useAppSelector((appState) => ({
    compiledEditorRef: appState.compiledEditorRef,
    compiledVegaPaneSize: appState.compiledVegaPaneSize,
    compiledVegaSpec: appState.compiledVegaSpec,
    configEditorString: appState.configEditorString,
    decorations: appState.decorations,
    editorFocus: appState.editorFocus,
    editorRef: appState.editorRef,
    editorString: appState.editorString,
    gist: appState.gist,
    manualParse: appState.manualParse,
    mode: appState.mode,
    parse: appState.parse,
    selectedExample: appState.selectedExample,
    sidePaneItem: appState.sidePaneItem,
    themeName: appState.themeName,
    value: appState.editorString,
    view: appState.view,
  }));

  const actions = {
    clearConfig: () => dispatch(EditorActions.clearConfig()),
    extractConfigSpec: () => dispatch(EditorActions.extractConfigSpec()),
    logError: (error: Error) => dispatch(EditorActions.logError(error)),
    mergeConfigSpec: () => dispatch(EditorActions.mergeConfigSpec()),
    parseSpec: (force: boolean) => dispatch(EditorActions.parseSpec(force)),
    setConfig: (config: string) => dispatch(EditorActions.setConfig(config)),
    setDecorations: (decorations: any[]) => dispatch(EditorActions.setDecorations(decorations)),
    setEditorFocus: (focus: any) => dispatch(EditorActions.setEditorFocus(focus)),
    setEditorReference: (reference: any) => dispatch(EditorActions.setEditorReference(reference)),
    updateEditorString: (editorString: string) => dispatch(EditorActions.updateEditorString(editorString)),
    updateVegaLiteSpec: (spec: string, config?: string) => dispatch(EditorActions.updateVegaLiteSpec(spec, config)),
    updateVegaSpec: (spec: string, config?: string) => dispatch(EditorActions.updateVegaSpec(spec, config)),
  };

  return <EditorWithNavigation {...stateProps} {...actions} />;
};

export default SpecEditor;
