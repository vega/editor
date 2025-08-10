import * as React from 'react';
import {useAppContext} from '../../../context/app-context.js';
import EditorWithNavigation from './renderer.js';
import {Mode} from '../../../constants/index.js';

const SpecEditor = () => {
  const {setState} = useAppContext();

  return (
    <EditorWithNavigation
      clearConfig={() =>
        setState((s) => ({
          ...s,
          config: {},
          configEditorString: '{}',
          themeName: 'custom',
        }))
      }
      extractConfigSpec={() => setState((s) => ({...s, extractConfigSpec: true}))}
      logError={(error: Error) => setState((s) => ({...s, error}))}
      mergeConfigSpec={() => setState((s) => ({...s, mergeConfigSpec: true}))}
      parseSpec={(force: boolean) => setState((s) => ({...s, parse: force}))}
      setConfig={(config: string) => setState((s) => ({...s, configEditorString: config}))}
      setDecorations={(decoration: any[]) => setState((s) => ({...s, decorations: decoration}))}
      setEditorFocus={(focus: any) => setState((s) => ({...s, editorFocus: focus}))}
      setEditorReference={(reference: any) => setState((s) => ({...s, editorRef: reference}))}
      updateEditorString={(editorString: string) => setState((s) => ({...s, editorString}))}
      updateVegaLiteSpec={(spec: string, config?: string) =>
        setState((s) => ({...s, editorString: spec, mode: Mode.VegaLite, ...(config && {configEditorString: config})}))
      }
      updateVegaSpec={(spec: string, config?: string) =>
        setState((s) => ({...s, editorString: spec, mode: Mode.Vega, ...(config && {configEditorString: config})}))
      }
    />
  );
};

export default SpecEditor;
