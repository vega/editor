import * as React from 'react';
import * as EditorActions from '../../actions/editor.js';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import './config-editor.css';
import Renderer from './renderer.js';

const ConfigEditor = () => {
  const dispatch = useAppDispatch();

  return (
    <Renderer
      extractConfig={() => dispatch(EditorActions.extractConfigSpec())}
      mergeConfigSpec={() => dispatch(EditorActions.mergeConfigSpec())}
      setConfig={(config: string) => dispatch(EditorActions.setConfig(config))}
      setConfigEditorString={(configString: string) => dispatch(EditorActions.setConfigEditorString(configString))}
      setEditorReference={(reference: any) => dispatch(EditorActions.setEditorReference(reference))}
      setThemeName={(theme: string) => dispatch(EditorActions.setThemeName(theme))}
    />
  );
};

export default ConfigEditor;
