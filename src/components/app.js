import React from 'react';
import Renderer from './renderer';
import Header from './header';
import SplitPane from 'react-split-pane';
import InputPanel from './input-panel';
import {LAYOUT} from '../constants';
import * as EditorActions from '../actions/editor';
import {connect} from 'react-redux';
import './app.css';
import {hashHistory} from 'react-router';
import {text} from 'd3-request';
import equal from 'deep-equal';

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
    if (parameter.mode && hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
       this.props.setMode(parameter.mode);
    }
    this.setExample(this.props.params);
  }

  componentWillReceiveProps(nextProps) {
    if (!equal(this.props.params, nextProps.params)) {
      this.setExample(nextProps.params);
    }
  }

  setExample(parameter) {
    if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
      if (parameter && parameter.example_name) {
        // open example

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
      } else if (parameter && parameter.mode) {
        // new spec
        if (parameter.mode === 'vega') {
          this.props.setVegaExample(name, '{}');
        } else if (parameter.mode === 'vega-lite') {
          this.props.setVegaLiteExample(name, '{}');
        }
      }
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
            <Renderer />
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
    }
  };
};

export default connect(null, mapDispatchToProps)(App);
