import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import { bindActionCreators, Dispatch } from 'redux';
import { hash, mergeDeep } from 'vega-lite/build/src/util';
import * as EditorActions from '../actions/editor';
import { LAYOUT, Mode } from '../constants';
import { NAME_TO_MODE, SIDEPANE, VEGA_LITE_START_SPEC, VEGA_START_SPEC } from '../constants/consts';
import { State } from '../constants/default-state';
import './app.css';
import Header from './header';
import InputPanel from './input-panel';
import Sidebar from './sidebar';
import VizPane from './viz-pane';

type Props = ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps> & RouteComponentProps;

class App extends React.PureComponent<Props & { match: any; location: any; showExample?: boolean }> {
  public w = window.innerWidth;
  public componentDidMount() {
    window.addEventListener(
      'message',
      evt => {
        const data = evt.data;
        if (!data.spec) {
          return;
        }
        // setting baseURL as event's origin
        this.props.setBaseUrl(evt.origin);
        console.info('[Vega-Editor] Received Message', evt.origin, data);
        // send acknowledgement
        const parsed = JSON.parse(data.spec);
        // merging config into the spec
        if (data.config) {
          mergeDeep(parsed, { config: data.config });
        }
        data.spec = stringify(parsed);
        if (data.spec || data.file) {
          // FIXME: remove any
          (evt as any).source.postMessage(true, '*');
        }
        if (data.spec) {
          if (data.mode.toUpperCase() === 'VEGA') {
            this.props.updateVegaSpec(data.spec);
          } else if (data.mode.toUpperCase() === 'VEGA-LITE') {
            this.props.updateVegaLiteSpec(data.spec);
          }
        }
        if (data.renderer) {
          this.props.setRenderer(data.renderer);
        }
      },
      false
    );

    const parameter = this.props.match.params;
    if (parameter.mode) {
      if (parameter.mode === 'vega' || 'vega-lite') {
        this.props.setModeOnly(parameter.mode);
      }
    }
    this.setSpecInUrl(parameter);
  }

  public componentWillReceiveProps(nextProps) {
    if (hash(this.props.match.params) !== hash(nextProps.match.params)) {
      this.setSpecInUrl(nextProps.match.params);
    }
  }

  public setSpecInUrl(parameter) {
    if (parameter) {
      if (parameter.example_name) {
        this.setExample(parameter);
      } else if (parameter.mode && !parameter.compressed) {
        this.setEmptySpec(NAME_TO_MODE[parameter.mode]);
      } else if (parameter.id) {
        this.setGist(parameter);
      }
    }
  }

  public async setExample(parameter: { example_name: string; mode: string }) {
    const name = parameter.example_name;
    this.props.setConfig(this.props.configEditorString);
    this.props.setSidePaneItem(SIDEPANE.Editor);
    switch (parameter.mode) {
      case 'vega': {
        const r = await fetch(`./spec/vega/${name}.vg.json`);
        this.props.setVegaExample(name, await r.text());
        break;
      }
      case 'vega-lite': {
        const r = await fetch(`./spec/vega-lite/${name}.vl.json`);
        this.props.setVegaLiteExample(name, await r.text());
        break;
      }
      default:
        console.warn(`Unknown mode ${parameter.mode}`);
        break;
    }
  }

  public setEmptySpec(mode: Mode) {
    if (mode === Mode.Vega) {
      this.props.updateVegaSpec(VEGA_START_SPEC);
    } else if (mode === Mode.VegaLite) {
      this.props.updateVegaLiteSpec(VEGA_LITE_START_SPEC);
    }
  }

  public async setGist(parameter: { id: string; filename: string; revision?: string }) {
    await fetch(
      `https://api.github.com/gists/${parameter.id}${parameter.revision !== undefined ? `/${parameter.revision}` : ''}`
    )
      .then(res => res.json())
      .then(json => {
        const contentObj = JSON.parse(json.files[parameter.filename].content);
        if (!contentObj.hasOwnProperty('$schema')) {
          this.props.setGistVegaLiteSpec('', json.files[parameter.filename].content);
        } else {
          const mode = contentObj.$schema.split('/').slice(-2)[0];
          if (mode === Mode.Vega) {
            this.props.setGistVegaSpec('', json.files[parameter.filename].content);
          } else if (mode === Mode.VegaLite) {
            this.props.setGistVegaLiteSpec('', json.files[parameter.filename].content);
          }
        }
      });
  }

  public render() {
    return (
      <div className="app-container">
        <Header showExample={this.props.showExample} />
        <div
          style={{
            height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`,
          }}
          className="main-panel"
        >
          <SplitPane
            split="vertical"
            minSize={300}
            defaultSize={this.w * 0.4}
            pane1Style={{ display: 'flex' }}
            className="main-pane"
            pane2Style={{ overflow: 'scroll' }}
            style={{ position: 'relative' }}
          >
            <InputPanel />
            <VizPane />
          </SplitPane>
          {this.props.settings && <Sidebar />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: State) {
  return {
    configEditorString: state.configEditorString,
    settings: state.settings,
    view: state.view,
  };
}

function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setBaseUrl: EditorActions.setBaseUrl,
      setConfig: EditorActions.setConfig,
      setGistVegaLiteSpec: EditorActions.setGistVegaLiteSpec,
      setGistVegaSpec: EditorActions.setGistVegaSpec,
      setModeOnly: EditorActions.setModeOnly,
      setRenderer: EditorActions.setRenderer,
      setSettingsState: EditorActions.setSettingsState,
      setSidePaneItem: EditorActions.setSidePaneItem,
      setVegaExample: EditorActions.setVegaExample,
      setVegaLiteExample: EditorActions.setVegaLiteExample,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
