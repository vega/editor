import * as React from 'react';
import * as EditorActions from '../../actions/editor.js';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import './config-editor.css';
import Renderer from './renderer.js';

const ConfigEditor = () => {
  const dispatch = useAppDispatch();

  const stateProps = useAppSelector((appState) => ({
    compiledVegaPaneSize: appState.compiledVegaPaneSize,
    compiledVegaSpec: appState.compiledVegaSpec,
    config: appState.config,
    configEditorString: appState.configEditorString,
    decorations: appState.decorations,
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
  }));

  const actions = {
    extractConfig: () => dispatch(EditorActions.extractConfigSpec()),
    mergeConfigSpec: () => dispatch(EditorActions.mergeConfigSpec()),
    setConfig: (config: string) => dispatch(EditorActions.setConfig(config)),
    setConfigEditorString: (configString: string) => dispatch(EditorActions.setConfigEditorString(configString)),
    setEditorReference: (reference: any) => dispatch(EditorActions.setEditorReference(reference)),
    setThemeName: (theme: string) => dispatch(EditorActions.setThemeName(theme)),
  };

  return <Renderer {...stateProps} {...actions} />;
};

export default ConfigEditor;
