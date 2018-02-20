import './app.css';

import {text} from 'd3-request';
import equal from 'deep-equal';
import * as React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import SplitPane from 'react-split-pane';

import * as EditorActions from '../actions/editor';
import {LAYOUT, Mode} from '../constants';
import {NAME_TO_MODE, VEGA_LITE_START_SPEC, VEGA_START_SPEC} from '../constants/consts';
import Header from './header';
import InputPanel from './input-panel';
import VizPane from './viz-pane';

type Props = ReturnType<typeof mapDispatchToProps>;

class App extends React.Component<Props & {match: any, history: any}> {
  public componentDidMount() {
    window.addEventListener(
      'message',
      (evt) => {
        const data = evt.data;
        if (!data.spec) {
          return;
        }
        console.info('[Vega-Editor] Received Message', evt.origin, data);
        // send acknowledgement
        const parsed = JSON.parse(data.spec);
        data.spec = JSON.stringify(parsed, null, 2);
        if (data.spec || data.file) {
          evt.source.postMessage(true, '*');
        }
        if (data.spec) {
          if (data.mode.toUpperCase() === 'VEGA') {
            this.props.updateVegaSpec(data.spec);
          } else if (data.mode.toUpperCase() === 'VEGA-LITE') {
            this.props.updateVegaLiteSpec(data.spec);
          }
        }
      },
      false,
    );

    const parameter = this.props.match.params;
    this.setSpecInUrl(parameter);
  }
  public componentWillReceiveProps(nextProps) {
    if (!equal(this.props.match.params, nextProps.match.params)) {
      this.setSpecInUrl(nextProps.match.params);
    }
  }
  public setSpecInUrl(parameter) {
    if (parameter && parameter.mode && this.props.history.location.pathname.indexOf('/edited') === -1) {
      if (parameter.example_name) {
        this.setExample(parameter);
      } else if (parameter.username && parameter.id) {
        this.setGist(parameter);
      } else {
        this.props.setMode(NAME_TO_MODE[parameter.mode]);
      }
    }
  }
  public setGist(parameter) {
    const prefix = 'https://hook.io/tianyiii/vegaeditor';
    const vegaVersion = parameter.mode;
    const hookUrl = `${prefix}/${vegaVersion}/${parameter.username}/${
      parameter.id
    }`;
    fetch(hookUrl, {
      method: 'get',
      mode: 'cors',
    })
      .then((response) => {
        if (response.status === 200) {
          return Promise.resolve(response);
        } else {
          return Promise.reject(new Error(response.statusText));
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data['message'] !== 'Not Found') {
          if (vegaVersion === 'vega') {
            this.props.setGistVegaSpec(hookUrl, JSON.stringify(data, null, 2));
          } else if (vegaVersion === 'vega-lite') {
            this.props.setGistVegaLiteSpec(
              hookUrl,
              JSON.stringify(data, null, 2),
            );
          }
        } else {
          console.warn('invalid url');
        }
      })
      .catch((ex) => {
        console.error(ex);
      });
  }

  public setExample(parameter: {example_name: string, mode: string}) {
    const name = parameter.example_name;
    switch (parameter.mode) {
      case 'vega':
        text(`./spec/vega/${name}.vg.json`, (spec) => {
          this.props.setVegaExample(name, spec);
        });
        break;
      case 'vega-lite':
        text(`./spec/vega-lite/${name}.vl.json`, (spec) => {
          this.props.setVegaLiteExample(name, spec);
        });
        break;
      default:
        console.warn(`Unknown mode ${parameter.mode}`);
        break;
    }
  }
  // TODO: this is unused but should be used to set the specs when the creates an empty spec
  public setEmptySpec(parameter) {
    if (parameter.mode === Mode.Vega) {
      this.props.updateVegaSpec(VEGA_START_SPEC);
    } else if (parameter.mode === Mode.VegaLite) {
      this.props.updateVegaLiteSpec(VEGA_LITE_START_SPEC);
    }
  }
  public render() {
    const w = window.innerWidth;
    return (
      <div className='app-container'>
        <Header />
        <div
          style={{
            position: 'relative',
            height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`,
          }}
        >
          <SplitPane
            split='vertical'
            minSize={300}
            defaultSize={w * 0.4}
            pane1Style={{display: 'flex'}}
            className='main-pane'
            pane2Style={{overflow: 'scroll'}}
          >
            <InputPanel />
            <VizPane />
          </SplitPane>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    setMode: (mode: Mode) => {
      dispatch(EditorActions.setMode(mode));
    },
    updateVegaSpec: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    },
    updateVegaLiteSpec: (val) => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    },
    setVegaExample: (example: string, val) => {
      dispatch(EditorActions.setVegaExample(example, val));
    },
    setVegaLiteExample: (example: string, val) => {
      dispatch(EditorActions.setVegaLiteExample(example, val));
    },
    setGistVegaSpec: (gist: string, spec) => {
      dispatch(EditorActions.setGistVegaSpec(gist, spec));
    },
    setGistVegaLiteSpec: (gist: string, spec) => {
      dispatch(EditorActions.setGistVegaLiteSpec(gist, spec));
    },
  };
};

export default withRouter(connect(null, mapDispatchToProps)(App));
