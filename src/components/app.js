import React from 'react';
import Renderer from './renderer';
import Header from './header';
import SplitPane from 'react-split-pane';
import InputPanel from './input-panel';
import Toolbar from './toolbar';
import { LAYOUT } from '../constants';

import './app.css';

export default class App extends React.Component {

  render () {

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
