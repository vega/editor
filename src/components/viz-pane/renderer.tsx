import * as React from 'react';
import SplitPane from 'react-split-pane';
import {mapDispatchToProps, mapStateToProps} from '.';
import {EDITOR_FOCUS, LAYOUT, NAVBAR, WORD_SEPARATORS} from '../../constants';
import DataViewer from '../data-viewer';
import ErrorBoundary from '../error-boundary';
import ErrorPane from '../error-pane';
import Renderer from '../renderer';
import SignalViewer from '../signal-viewer';
import DebugPaneHeader from './debug-pane-header';
import './index.css';
import {version as VG_VERSION} from 'vega';
import {version as VL_VERSION} from 'vega-lite';
import {version as TOOLTIP_VERSION} from 'vega-tooltip';
const pjson = require('../../../package.json');

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
      rangeValue.map((match) => {
        return {
          options: {inlineClassName: 'myInlineDecoration'},
          range: match.range,
        };
      })
    );

    this.props.setDecorations(decorations);

    if (rangeValue[0]) {
      editor.revealRangeInCenter(rangeValue[0].range);
      editor.focus();
      editor.layout();
      setImmediate(() => {
        (document.activeElement as HTMLElement).blur();
      });
    }
  }
  public handleChange(size: number) {
    this.props.setDebugPaneSize(size);
    if ((size > LAYOUT.MinPaneSize && !this.props.debugPane) || (size === LAYOUT.MinPaneSize && this.props.debugPane)) {
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
          Vega {VG_VERSION}, Vega-Lite {VL_VERSION}, Vega-Tooltip {TOOLTIP_VERSION}, Editor {pjson.version}
        </div>
      </div>
    );
    return (
      <SplitPane
        split="horizontal"
        primary="second"
        minSize={LAYOUT.MinPaneSize}
        defaultSize={this.props.debugPane ? this.props.debugPaneSize : LAYOUT.MinPaneSize}
        onChange={this.handleChange}
        pane1Style={{minHeight: `${LAYOUT.MinPaneSize}px`}}
        pane2Style={{
          height: this.props.debugPane
            ? (this.props.debugPaneSize || window.innerHeight * 0.4) + 'px'
            : LAYOUT.MinPaneSize + 'px',
        }}
        paneStyle={{display: 'flex'}}
        onDragStarted={() => {
          if (this.props.navItem === NAVBAR.Logs) {
            this.props.showLogs(true);
          }
        }}
        onDragFinished={() => {
          if (this.props.debugPaneSize === LAYOUT.MinPaneSize) {
            this.props.setDebugPaneSize(LAYOUT.DebugPaneSize);
            // Popping up the the debug panel for the first time will set its
            // height to LAYOUT.DebugPaneSize. This can change depending on the UI.
          }
        }}
      >
        {container}

        <div className="debug-pane">
          <DebugPaneHeader />
          {this.props.error || (this.props.logs && this.props.navItem === NAVBAR.Logs) ? (
            <ErrorPane />
          ) : (
            this.getContextViewer()
          )}
        </div>
      </SplitPane>
    );
  }
}
