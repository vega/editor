import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import './config-editor.css';
import Renderer from './renderer.js';

const ConfigEditor = () => {
  const {setState} = useAppContext();

  return (
    <Renderer
      extractConfig={() => setState((s) => ({...s, extractConfig: true}))}
      mergeConfigSpec={() => setState((s) => ({...s, mergeConfigSpec: true}))}
      setConfig={(config: string) => setState((s) => ({...s, configEditorString: config}))}
      setConfigEditorString={(configString: string) => setState((s) => ({...s, configEditorString: configString}))}
      setEditorReference={(reference: any) => setState((s) => ({...s, editorRef: reference}))}
      setThemeName={(theme: string) => setState((s) => ({...s, themeName: theme}))}
    />
  );
};

export default ConfigEditor;
