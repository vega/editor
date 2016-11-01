import React from 'react';
import Renderer from './renderer';
import Header from './header';
import SplitPane from 'react-split-pane';
import InputPanel from './input-panel';


import './app.css';

export default class App extends React.Component {

  render () {

    const w = window.innerWidth;

    return (
      <div>
        <Header />
        <SplitPane split="vertical" minSize={300} defaultSize={w * 0.33}>
          <InputPanel />
          <Renderer />
        </SplitPane>
      </div>
    );
  };
};
