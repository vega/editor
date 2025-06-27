import * as React from 'react';
import {useCallback} from 'react';
import * as EditorActions from '../../actions/editor.js';
import {useAppSelector, useAppDispatch} from '../../hooks.js';
import Renderer from './renderer.js';

const VizPaneContainer: React.FC = () => {
  const dispatch = useAppDispatch();

  const props = useAppSelector((state) => ({
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

  const setDebugPaneSize = useCallback((size: number) => dispatch(EditorActions.setDebugPaneSize(size)), [dispatch]);

  const setDecorations = useCallback(
    (newDecorations: any[]) => dispatch(EditorActions.setDecorations(newDecorations)),
    [dispatch],
  );

  const showLogs = useCallback((show: boolean) => dispatch(EditorActions.showLogs(show)), [dispatch]);

  const toggleDebugPane = useCallback(() => dispatch(EditorActions.toggleDebugPane()), [dispatch]);

  const toggleNavbar = useCallback((item: string) => dispatch(EditorActions.toggleNavbar(item)), [dispatch]);

  return (
    <Renderer
      {...props}
      setDebugPaneSize={setDebugPaneSize}
      setDecorations={setDecorations}
      showLogs={showLogs}
      toggleDebugPane={toggleDebugPane}
      toggleNavbar={toggleNavbar}
    />
  );
};

export default VizPaneContainer;
