import * as React from 'react';
import {useCallback, useEffect, useRef} from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import * as EditorActions from '../../../actions/editor.js';
import {NAVBAR} from '../../../constants/consts.js';
import {useAppSelector, useAppDispatch} from '../../../hooks.js';

const DebugPaneHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const effectRan = useRef(false);

  const {debugPane, error, errors, logs, navItem, warns} = useAppSelector((state) => ({
    debugPane: state.debugPane,
    error: state.error,
    errors: state.errors,
    logs: state.logs,
    navItem: state.navItem,
    warns: state.warns,
  }));

  const showLogs = useCallback((show: boolean) => dispatch(EditorActions.showLogs(show)), [dispatch]);

  const toggleDebugPane = useCallback(() => dispatch(EditorActions.toggleDebugPane()), [dispatch]);

  const toggleNavbar = useCallback((item: string) => dispatch(EditorActions.toggleNavbar(item)), [dispatch]);

  useEffect(() => {
    if (!effectRan.current && (logs || navItem === NAVBAR.Logs)) {
      effectRan.current = true;
      showLogs(true);
    }
  }, [logs, navItem, showLogs]);

  const handleLogsClick = useCallback(
    (e: React.MouseEvent) => {
      if (debugPane) {
        e.stopPropagation();
      }
      showLogs(true);
      toggleNavbar(NAVBAR.Logs);
    },
    [debugPane, showLogs, toggleNavbar],
  );

  const handleDataViewerClick = useCallback(
    (e: React.MouseEvent) => {
      if (debugPane) {
        e.stopPropagation();
      }
      showLogs(false);
      toggleNavbar(NAVBAR.DataViewer);
    },
    [debugPane, showLogs, toggleNavbar],
  );

  const handleSignalViewerClick = useCallback(
    (e: React.MouseEvent) => {
      if (debugPane) {
        e.stopPropagation();
      }
      showLogs(false);
      toggleNavbar(NAVBAR.SignalViewer);
    },
    [debugPane, showLogs, toggleNavbar],
  );

  const handleDataflowViewerClick = useCallback(
    (e: React.MouseEvent) => {
      if (debugPane) {
        e.stopPropagation();
      }
      showLogs(false);
      toggleNavbar(NAVBAR.DataflowViewer);
    },
    [debugPane, showLogs, toggleNavbar],
  );

  return (
    <div className="pane-header" onClick={toggleDebugPane}>
      <ul className="tabs-nav">
        <li className={error || (logs && navItem === NAVBAR.Logs) ? 'active-tab' : undefined} onClick={handleLogsClick}>
          <span className="logs-text">Logs</span>
          {error ? (
            <span className="error">(Error)</span>
          ) : errors.length > 0 ? (
            <span className="error">({errors.length})</span>
          ) : warns.length > 0 ? (
            <span className="warnings-count">({warns.length})</span>
          ) : (
            ''
          )}
        </li>
        {error === null && (
          <li className={navItem === NAVBAR.DataViewer ? 'active-tab' : undefined} onClick={handleDataViewerClick}>
            Data Viewer
          </li>
        )}
        {error === null && (
          <li className={navItem === NAVBAR.SignalViewer ? 'active-tab' : undefined} onClick={handleSignalViewerClick}>
            Signal Viewer
          </li>
        )}
        {error === null && (
          <li
            className={navItem === NAVBAR.DataflowViewer ? 'active-tab' : undefined}
            onClick={handleDataflowViewerClick}
          >
            Dataflow Viewer
          </li>
        )}
      </ul>
      {debugPane ? <ChevronDown /> : <ChevronUp />}
    </div>
  );
};

export default DebugPaneHeader;
