import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import Split from 'react-split';
import {version as VG_VERSION} from 'vega';
import {version as VL_VERSION} from 'vega-lite';
import {version as TOOLTIP_VERSION} from 'vega-tooltip';

import {EDITOR_FOCUS, LAYOUT, NAVBAR, WORD_SEPARATORS} from '../../constants/index.js';
import {DataflowViewer} from '../../features/dataflow/DataflowViewer.js';
import DataViewer from '../data-viewer/renderer.js';
import ErrorBoundary from '../error-boundary/index.js';
import ErrorPane from '../error-pane/index.js';
import {COMMIT_HASH} from '../header/help-modal/index.js';
import Renderer from '../renderer/index.js';
import SignalViewer from '../signal-viewer/renderer.js';
import DebugPaneHeader from './debug-pane-header/index.js';
import './index.css';
import type * as Monaco from 'monaco-editor';

interface VizPaneProps {
  compiledEditorRef: any;
  debugPane: boolean;
  debugPaneSize: number;
  decorations: any[];
  editorFocus: string;
  editorRef: Monaco.editor.IStandaloneCodeEditor;
  error: {message: string} | null;
  errors: any[];
  logs: boolean;
  navItem: string;
  settings: boolean;
  view: any;
  setDebugPaneSize: (size: number) => void;
  setDecorations: (decorations: any[]) => void;
  showLogs: (show: boolean) => void;
  toggleDebugPane: () => void;
  toggleNavbar: (item: string) => void;
}

const VizPane: React.FC<VizPaneProps> = (props) => {
  const initialSetupDone = useRef(false);

  useEffect(() => {
    if (props.logs && !initialSetupDone.current) {
      initialSetupDone.current = true;
      props.showLogs(true);
    }
  }, [props.logs, props.showLogs]);

  useEffect(() => {
    const handleResize = () => {
      if (props.debugPane && props.debugPaneSize > LAYOUT.MinPaneSize) {
        const totalHeight = window.innerHeight;
        const currentPercentage = (props.debugPaneSize / totalHeight) * 100;
        const newDebugPaneSize = totalHeight * (currentPercentage / 100);
        props.setDebugPaneSize(newDebugPaneSize);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [props.debugPane, props.debugPaneSize, props.setDebugPaneSize]);

  useEffect(() => {
    if (props.debugPaneSize === LAYOUT.MinPaneSize && !initialSetupDone.current) {
      initialSetupDone.current = true;
      props.setDebugPaneSize(LAYOUT.DebugPaneSize);
    }

    // Show logs when there's an error, but without causing loops
    if ((props.error || props.errors.length > 0) && !props.logs) {
      props.showLogs(true);
    }
  }, [props.debugPaneSize, props.error, props.errors.length, props.logs, props.setDebugPaneSize, props.showLogs]);

  const onClickHandler = useCallback(
    (itemHeader: string) => {
      const mainEditor = props.editorRef;
      const compiledEditor = props.compiledEditorRef;

      const editor = props.editorFocus === EDITOR_FOCUS.SpecEditor ? mainEditor : compiledEditor;

      const model = editor.getModel();

      const rangeValue = model.findMatches(itemHeader, true, true, true, WORD_SEPARATORS, true);

      const decorationObjects = rangeValue.map((match) => ({
        options: {inlineClassName: 'myInlineDecoration'},
        range: match.range,
      }));

      props.setDecorations(decorationObjects);

      if (editor && decorationObjects.length > 0) {
        editor.deltaDecorations([], decorationObjects);
      }

      if (rangeValue[0]) {
        editor.revealRangeInCenter(rangeValue[0].range);
        editor.focus();
        editor.layout();
        Promise.resolve().then(() => {
          (document.activeElement as HTMLElement).blur();
        });
      }
    },
    [props.editorRef, props.compiledEditorRef, props.editorFocus, props.decorations, props.setDecorations],
  );

  const handleChange = useCallback(
    (sizes: number[]) => {
      const size = (sizes[1] / 100) * window.innerHeight;
      props.setDebugPaneSize(size);
    },
    [props.setDebugPaneSize],
  );

  const handleDragStart = useCallback(() => {
    if (props.navItem === NAVBAR.Logs) {
      props.showLogs(true);
    }
  }, [props.navItem, props.showLogs]);

  const handleDragEnd = useCallback(
    (sizes?: number[]) => {
      const size = (sizes[1] / 100) * window.innerHeight;
      const tolerance = 5;
      const shouldBeOpen = size > LAYOUT.MinPaneSize + tolerance;
      if (shouldBeOpen !== props.debugPane) {
        props.toggleDebugPane();
      }
      // Popping up the debug panel for the first time will set its
      // height to LAYOUT.DebugPaneSize. This can change depending on the UI.
      if (size === LAYOUT.MinPaneSize && props.debugPaneSize === LAYOUT.MinPaneSize) {
        props.setDebugPaneSize(LAYOUT.DebugPaneSize);
      }
    },
    [props.debugPane, props.debugPaneSize, props.toggleDebugPane, props.setDebugPaneSize],
  );
  /**
   *  Get the Component to be rendered in the Context Viewer.
   */
  const getContextViewer = useCallback(() => {
    if (!props.debugPane) {
      return null;
    }
    if (props.view) {
      switch (props.navItem) {
        case NAVBAR.DataViewer:
          return <DataViewer onClickHandler={onClickHandler} />;
        case NAVBAR.SignalViewer:
          return <SignalViewer onClickHandler={onClickHandler} />;
        case NAVBAR.DataflowViewer:
          return <DataflowViewer />;
        default:
          return null;
      }
    } else {
      return null;
    }
  }, [props.debugPane, props.view, props.navItem, onClickHandler]);

  const container = (
    <div className="chart-container">
      <ErrorBoundary>
        <Renderer />
      </ErrorBoundary>
      <div className="versions">
        Vega {VG_VERSION}, Vega-Lite {VL_VERSION}, Vega-Tooltip {TOOLTIP_VERSION}, Editor {COMMIT_HASH.slice(0, 7)}
      </div>
    </div>
  );

  const getInitialSizes = useCallback(() => {
    const debugPaneSize = props.debugPane
      ? Math.max(props.debugPaneSize || LAYOUT.DebugPaneSize, LAYOUT.DebugPaneSize)
      : LAYOUT.MinPaneSize;

    const totalHeight = window.innerHeight;
    const debugPanePercentage = (debugPaneSize / totalHeight) * 100;

    const minPercentage = (LAYOUT.MinPaneSize / totalHeight) * 100;
    const finalDebugPercentage = Math.max(debugPanePercentage, minPercentage);
    const finalChartPercentage = 100 - finalDebugPercentage;

    return [finalChartPercentage, finalDebugPercentage];
  }, [props.debugPane, props.debugPaneSize]);

  const debugPaneContent = useMemo(() => {
    if (!props.debugPane) {
      return null;
    }

    if (props.error || (props.logs && props.navItem === NAVBAR.Logs)) {
      return <ErrorPane />;
    }

    return getContextViewer();
  }, [props.debugPane, props.error, props.logs, props.navItem, getContextViewer]);

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Split
        key={props.debugPane ? 'debug-open' : 'debug-closed'}
        sizes={getInitialSizes()}
        minSize={LAYOUT.MinPaneSize}
        expandToMin={false}
        gutterSize={3}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="vertical"
        cursor="row-resize"
        className="editor-splitPane"
        onDrag={handleChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {container}

        <div className="debug-pane">
          <DebugPaneHeader />
          {debugPaneContent}
        </div>
      </Split>
    </div>
  );
};

export default VizPane;
