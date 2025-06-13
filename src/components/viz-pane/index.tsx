import * as React from 'react';
import * as EditorActions from '../../actions/editor.js';
import {useAppSelector, useAppDispatch} from '../../hooks.js';
import Renderer from './renderer.js';

const VizPaneContainer: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    compiledEditorRef,
    debugPane,
    debugPaneSize,
    decorations,
    editorFocus,
    editorRef,
    error,
    errors,
    logs,
    navItem,
    settings,
    view,
  } = useAppSelector((state) => ({
    compiledEditorRef: state.compiledEditorRef,
    debugPane: state.debugPane,
    debugPaneSize: state.debugPaneSize,
    decorations: state.decorations,
    editorFocus: state.editorFocus,
    editorRef: state.editorRef,
    error: state.error,
    errors: state.errors,
    logs: state.logs,
    navItem: state.navItem,
    settings: state.settings,
    view: state.view,
  }));

  const actions = {
    setDebugPaneSize: (size: number) => dispatch(EditorActions.setDebugPaneSize(size)),
    setDecorations: (newDecorations: any[]) => dispatch(EditorActions.setDecorations(newDecorations)),
    showLogs: (show: boolean) => dispatch(EditorActions.showLogs(show)),
    toggleDebugPane: () => dispatch(EditorActions.toggleDebugPane()),
    toggleNavbar: (item: string) => dispatch(EditorActions.toggleNavbar(item)),
  };

  return (
    <Renderer
      compiledEditorRef={compiledEditorRef}
      debugPane={debugPane}
      debugPaneSize={debugPaneSize}
      decorations={decorations}
      editorFocus={editorFocus}
      editorRef={editorRef}
      error={error}
      errors={errors}
      logs={logs}
      navItem={navItem}
      settings={settings}
      view={view}
      {...actions}
    />
  );
};

export default VizPaneContainer;
