import './app.css';

import { text } from 'd3-request';
import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import { util } from 'vega-lite';
import { hash } from 'vega-lite/build/src/util';

import * as EditorActions from '../actions/editor';
import { LAYOUT, Mode } from '../constants';
import { NAME_TO_MODE, VEGA_LITE_START_SPEC, VEGA_START_SPEC } from '../constants/consts';
import Header from './header';
import InputPanel from './input-panel';
import VizPane from './viz-pane';

type Props = ReturnType<typeof mapDispatchToProps>;

class App extends React.Component<Props & { match: any; location: any }> {
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
          util.mergeDeep(parsed, { config: data.config });
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
      } else if (parameter.username && parameter.id) {
        this.setGist(parameter);
      } else if (parameter.mode && !parameter.compressed) {
        this.setEmptySpec(NAME_TO_MODE[parameter.mode]);
      }
    }
  }
  public async setGist(parameter: { mode: string; username: string; id: string; revision: string; filename: string }) {
    const gistUrl = `https://api.github.com/gists/${parameter.id}/${parameter.revision}`;

    const gistData = await fetch(gistUrl).then(r => r.json());

    const spec = gistData.files[parameter.filename].content;


    if (parameter.mode === 'vega') {
      this.props.setGistVegaSpec(gistUrl, spec);
    } else if (parameter.mode === 'vega-lite') {
      var jo = JSON.parse(spec);
      if ((typeof jo.data !== "undefined") && (typeof jo.data !== "undefined")) {
        var datafile = jo.data.url;
        if (typeof gistData.files[datafile] !== "undefined") {
            jo.data.url = gistData.files[datafile].raw_url;
            this.props.setGistVegaLiteSpec(gistUrl, JSON.stringify(jo));
        }
    }
  }

  public setExample(parameter: { example_name: string; mode: string }) {
    const name = parameter.example_name;
    switch (parameter.mode) {
      case 'vega':
        text(`./spec/vega/${name}.vg.json`, spec => {
          this.props.setVegaExample(name, spec);
        });
        break;
      case 'vega-lite':
        text(`./spec/vega-lite/${name}.vl.json`, spec => {
          this.props.setVegaLiteExample(name, spec);
        });
        break;
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

  public render() {
    const w = window.innerWidth;
    return (
      <div className="app-container">
        <Header />
        <div
          style={{
            height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`,
            position: 'relative',
          }}
        >
          <SplitPane
            split="vertical"
            minSize={300}
            defaultSize={w * 0.4}
            pane1Style={{ display: 'flex' }}
            className="main-pane"
            pane2Style={{ overflow: 'scroll' }}
          >
            <InputPanel />
            <VizPane />
          </SplitPane>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setBaseUrl: val => {
      dispatch(EditorActions.setBaseUrl(val));
    },
    setGistVegaLiteSpec: (gist: string, spec) => {
      dispatch(EditorActions.setGistVegaLiteSpec(gist, spec));
    },
    setGistVegaSpec: (gist: string, spec) => {
      dispatch(EditorActions.setGistVegaSpec(gist, spec));
    },
    setRenderer: val => {
      dispatch(EditorActions.setRenderer(val));
    },
    setVegaExample: (example: string, val) => {
      dispatch(EditorActions.setVegaExample(example, val));
    },
    setVegaLiteExample: (example: string, val) => {
      dispatch(EditorActions.setVegaLiteExample(example, val));
    },
    updateVegaLiteSpec: val => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    },
    updateVegaSpec: val => {
      dispatch(EditorActions.updateVegaSpec(val));
    },
  };
};

export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(App)
);
