import React from 'react';
import ErrorBoundary from './error-boundary'
import Renderer from './renderer';
import Header from './header';
import Toolbar from './toolbar';
import ErrorIndicator from './error-indicator';
import ErrorPane from './error-pane';
import SplitPane from 'react-split-pane';
import InputPanel from './input-panel';
import {LAYOUT} from '../constants';
import * as EditorActions from '../actions/editor';
import {connect} from 'react-redux';
import './app.css';
import {hashHistory} from 'react-router';
import {text} from 'd3-request';
import equal from 'deep-equal';
import {MODES} from '../constants';

class App extends React.Component {

  componentDidMount() {
    window.addEventListener('message', (evt) => {
      var data = evt.data;
      if (!data.spec) {
        return;
      }
      console.info('[Vega-Editor] Received Message', evt.origin, data);
      // send acknowledgement
      var parsed = JSON.parse(data.spec);
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
    }, false);

    const parameter = this.props.params;
    this.setSpecInUrl(parameter);
  }

  componentWillReceiveProps(nextProps) {
    if (!equal(this.props.params, nextProps.params)) {
      this.setSpecInUrl(nextProps.params);
    }
  }

  setSpecInUrl(parameter) {
    if (parameter && parameter.mode && hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
      if (parameter.example_name) {
        this.setExample(parameter);
      } else if (parameter.username && parameter.id) {
        this.setGist(parameter);
      } else {
        this.props.setMode(parameter.mode);
      }
    }
  }

  setGist(parameter) {
    const prefix = 'https://hook.io/tianyiii/vegaeditor';
    const vegaVersion = parameter.mode;
    const hookUrl = `${prefix}/${vegaVersion}/${parameter.username}/${parameter.id}`;

    fetch(hookUrl, {
      method: 'get',
      mode: 'cors'
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
          this.props.setGistVegaLiteSpec(hookUrl, JSON.stringify(data, null, 2));
        }
      } else {
        console.warn('invalid url');
      }
    })
    .catch((ex) => {
      console.error(ex);
    })
  }

  setExample(parameter) {
    const name = parameter.example_name;
    if (parameter.mode === 'vega') {
      text(`./spec/vega/${name}.vg.json`, spec => {
        this.props.setVegaExample(name, spec);
      });
    } else if (parameter.mode === 'vega-lite') {
      text(`./spec/vega-lite/${name}.vl.json`, spec => {
        this.props.setVegaLiteExample(name, spec);
      });
    }
  }

  setEmptySpec(parameter) {
    if (parameter.mode === MODES.Vega) {
      this.props.updateVegaSpec('{}');
    } else if (parameter.mode === MODES.VegaLite) {
      this.props.updateVegaLiteSpec('{}');
    }
  }

  render() {
    const w = window.innerWidth;
    return (
      <div className="app-container">
        <Header />
        <div style={{position: 'relative', height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`}}>
          <SplitPane split="vertical" minSize={300} defaultSize={w * 0.4} pane1Style={{display: 'flex'}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
            <InputPanel />
            <div className='chart-container'>
              <SplitPane split='horizontal' defaultSize={window.innerHeight * 0.6}
                paneStyle={{display: 'flex'}}>
                <ErrorBoundary>
                  <Renderer />
                </ErrorBoundary>
                <Toolbar />
                <ErrorPane />
              </SplitPane>
            </div>
          </SplitPane>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    setMode: (mode) => {
      dispatch(EditorActions.setMode(mode));
    },
    updateVegaSpec: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    },
    updateVegaLiteSpec: (val) => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    },
    setVegaExample: (example, val) => {
      dispatch(EditorActions.setVegaExample(example, val));
    },
    setVegaLiteExample: (example, val) => {
      dispatch(EditorActions.setVegaLiteExample(example, val));
    },
    setGistVegaSpec: (gist, spec) => {
      dispatch(EditorActions.setGistVegaSpec(gist, spec));
    },
    setGistVegaLiteSpec: (gist, spec) => {
      dispatch(EditorActions.setGistVegaLiteSpec(gist, spec));
    }
  };
};

export default connect(null, mapDispatchToProps)(App);
