import * as React from 'react';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {EDITOR_FOCUS, LAYOUT, NAVBAR, WORD_SEPARATORS} from '../../constants/index.js';
import DataViewer from '../data-viewer/index.js';
import ErrorBoundary from '../error-boundary/index.js';
import ErrorPane from '../error-pane/index.js';
import Renderer from '../renderer/index.js';
import SignalViewer from '../signal-viewer/index.js';
import DebugPaneHeader from './debug-pane-header/index.js';
import './index.css';
import {version as VG_VERSION} from 'vega';
import {version as VL_VERSION} from 'vega-lite';
import {version as TOOLTIP_VERSION} from 'vega-tooltip';
import {COMMIT_HASH} from '../header/help-modal/index.js';
import {DataflowViewer} from '../../features/dataflow/DataflowViewer.js';
import Split from 'react-split';

const defaultState = {
  header: '',
  maxRange: 0,
  range: 0,
};

type State = Readonly<typeof defaultState>;

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export default class VizPane extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.handleChange = this.handleChange.bind(this);
    this.getContextViewer = this.getContextViewer.bind(this);
  }
  public componentDidMount() {
    if (this.props.logs) {
      this.props.showLogs(true);
    }
  }

  public onClickHandler(header: string) {
    const mainEditor = this.props.editorRef;
    const compiledEditor = this.props.compiledEditorRef;

    const editor = this.props.editorFocus === EDITOR_FOCUS.SpecEditor ? mainEditor : compiledEditor;

    const model = editor.getModel();

    const rangeValue = model.findMatches(header, true, true, true, WORD_SEPARATORS, true);

    editor && editor.deltaDecorations(this.props.decorations, []);

    const decorations = editor.deltaDecorations(
      [],
      rangeValue.map((match) => ({
        options: {inlineClassName: 'myInlineDecoration'},
        range: match.range,
      })),
    );

    this.props.setDecorations(decorations);

    if (rangeValue[0]) {
      editor.revealRangeInCenter(rangeValue[0].range);
      editor.focus();
      editor.layout();
      Promise.resolve().then(() => {
        (document.activeElement as HTMLElement).blur();
      });
    }
  }

  public handleChange(sizes: number[]) {
    // react-split passes sizes as percentages, convert to pixels
    const size = (sizes[1] / 100) * window.innerHeight;
    this.props.setDebugPaneSize(size);

    // Use a small tolerance for floating point comparison
    const tolerance = 5; // 5px tolerance
    if (
      (size > LAYOUT.MinPaneSize + tolerance && !this.props.debugPane) ||
      (size <= LAYOUT.MinPaneSize + tolerance && this.props.debugPane)
    ) {
      this.props.toggleDebugPane();
    }
  }

  public componentDidUpdate() {
    if (this.props.debugPaneSize === LAYOUT.MinPaneSize) {
      this.props.setDebugPaneSize(LAYOUT.DebugPaneSize);
    }
    if (this.props.error || this.props.errors.length) {
      this.props.showLogs(true);
    }
  }

  /**
   *  Get the Component to be rendered in the Context Viewer.
   */
  public getContextViewer() {
    if (!this.props.debugPane) {
      return null;
    }
    if (this.props.view) {
      switch (this.props.navItem) {
        case NAVBAR.DataViewer:
          return <DataViewer onClickHandler={(header) => this.onClickHandler(header)} />;
        case NAVBAR.SignalViewer:
          return <SignalViewer onClickHandler={(header) => this.onClickHandler(header)} />;
        case NAVBAR.DataflowViewer:
          return <DataflowViewer />;
        default:
          return null;
      }
    } else {
      return null;
    }
  }

  public render() {
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

    // Calculate sizes exactly like the old implementation
    // When collapsed, use exactly MinPaneSize, when open use stored size
    const debugPaneSize = this.props.debugPane
      ? Math.max(this.props.debugPaneSize || LAYOUT.DebugPaneSize, LAYOUT.DebugPaneSize)
      : LAYOUT.MinPaneSize;

    // Convert pixel sizes to percentages for react-split
    const totalHeight = window.innerHeight;
    const debugPanePercentage = (debugPaneSize / totalHeight) * 100;
    const chartPercentage = 100 - debugPanePercentage;

    // Ensure we don't go below minimum percentage
    const minPercentage = (LAYOUT.MinPaneSize / totalHeight) * 100;
    const finalDebugPercentage = Math.max(debugPanePercentage, minPercentage);
    const finalChartPercentage = 100 - finalDebugPercentage;

    const sizes = [finalChartPercentage, finalDebugPercentage];

    return (
      <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Split
          sizes={sizes}
          minSize={LAYOUT.MinPaneSize}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="vertical"
          cursor="row-resize"
          onDrag={this.handleChange}
          onDragStart={() => {
            if (this.props.navItem === NAVBAR.Logs) {
              this.props.showLogs(true);
            }
          }}
          onDragEnd={() => {
            if (this.props.debugPaneSize === LAYOUT.MinPaneSize) {
              this.props.setDebugPaneSize(LAYOUT.DebugPaneSize);
              // Popping up the debug panel for the first time will set its
              // height to LAYOUT.DebugPaneSize. This can change depending on the UI.
            }
          }}
        >
          {container}

          <div className="debug-pane">
            <DebugPaneHeader />
            {this.props.debugPane && (
              <>
                {this.props.error || (this.props.logs && this.props.navItem === NAVBAR.Logs) ? (
                  <ErrorPane />
                ) : (
                  this.getContextViewer()
                )}
              </>
            )}
          </div>
        </Split>
      </div>
    );
  }
}
