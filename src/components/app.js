import React from 'react';
import Renderer from './renderer';
import Header from './header';
import SplitPane from 'react-split-pane';
import InputPanel from './input-panel';
import Toolbar from './toolbar';
import { LAYOUT } from '../constants';
import * as EditorActions from '../actions/editor';
import { connect } from 'react-redux';
import './app.css';

class App extends React.Component {

  componentDidMount() {
    window.addEventListener("message", (evt) => {
      var data = evt.data;
      console.log('[Vega-Editor] Received Message', evt.origin, data);
      // send acknowledgement
      var parsed = JSON.parse(data.spec);
      data.spec = JSON.stringify(parsed, null, 2);
      if (data.spec || data.file) {
        evt.source.postMessage(true, '*');
      }

      setTimeout(() => {
        if (data.spec) {
          if (data.mode.toUpperCase() === 'VEGA') {
            this.props.updateVegaSpec(data.spec);
            console.log("dispatch vega");
          } else if (data.mode.toUpperCase() === 'VEGA_LITE') {
            console.log("dispatch vega lite");
            this.props.updateVegaLiteSpec(data.spec);
          }
        }
      }, 500);
    }, false);
  }

  render () {
    setTimeout( () => {
      const parameter = this.props.params;
      if (parameter && parameter.example_name) {
        const name = parameter.example_name;
        if (parameter.vega === 'vega') {
          const spec = require(`../../spec/vega/${name}.vg.json`);
          this.props.setVegaExample(name, JSON.stringify(spec, null, 2));
        } else if (parameter.vega === 'vega_lite') {
          const spec = require(`../../spec/vega-lite/${name}.vl.json`);
          this.props.setVegaLiteExample(name, JSON.stringify(spec, null, 2));
        }
      }
     } , 1000); 
    
    const w = window.innerWidth;
    return (
      <div className="app-container">
        <Header />
        <div style={{position: 'relative', height: `calc(100vh - ${LAYOUT.HeaderHeight}px)`}}>
          <SplitPane split="vertical" minSize={300} defaultSize={w * 0.4}>
            <InputPanel />
            <Renderer />
          </SplitPane>
        </div>
        <Toolbar />
        <div>
          {
            (() => {
              if (process.env.NODE_ENV !== 'production') {
                const DevTools = require('./debug/dev-tools').default;
                return <DevTools visibleOnLoad={false} />;
              }
            })()
          }
        </div>
      </div>
    );
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
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
