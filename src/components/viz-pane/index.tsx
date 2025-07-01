import * as React from 'react';
import {useCallback} from 'react';
import {useAppContext} from '../../context/app-context.js';
import {PulsesProvider} from '../../features/dataflow/PulsesProvider';
import {NAVBAR} from '../../constants/index.js';
import VizPane from './renderer';

const VizPaneContainer: React.FC = () => {
  const {state, setState} = useAppContext();

  const setDebugPaneSize = useCallback(
    (size: number) => {
      setState((s) => ({...s, debugPaneSize: size}));
    },
    [setState],
  );

  const setDecorations = useCallback(
    (decorations: any[]) => {
      setState((s) => ({...s, decorations}));
    },
    [setState],
  );

  const showLogs = useCallback(
    (show: boolean) => {
      setState((s) => ({...s, logs: show}));
    },
    [setState],
  );

  const toggleDebugPane = useCallback(() => {
    setState((s) => ({...s, debugPane: !s.debugPane}));
  }, [setState]);

  const toggleNavbar = useCallback(
    (item: string) => {
      setState((s) => ({...s, navItem: item}));
    },
    [setState],
  );

  return (
    <PulsesProvider>
      <VizPane
        compiledEditorRef={state.compiledEditorRef}
        debugPane={state.debugPane}
        debugPaneSize={state.debugPaneSize}
        decorations={state.decorations}
        editorFocus={state.editorFocus}
        editorRef={state.editorRef}
        error={state.error}
        errors={state.errors}
        logs={state.logs}
        navItem={state.navItem}
        settings={state.settings}
        view={state.view}
        setDebugPaneSize={setDebugPaneSize}
        setDecorations={setDecorations}
        showLogs={showLogs}
        toggleDebugPane={toggleDebugPane}
        toggleNavbar={toggleNavbar}
      />
    </PulsesProvider>
  );
};

export default VizPaneContainer;
