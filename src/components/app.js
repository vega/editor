import React from 'react';
import SpecEditor from './spec-editor';
import Renderer from './renderer';
import Header from './header';
import SplitPane from 'react-split-pane';
import './app.css';

export default class App extends React.Component {

  render () {

    const w = window.innerWidth;

    return (
      <div>
        <Header />
        <SplitPane split="vertical" minSize={300} defaultSize={w * 0.33}>
          <SpecEditor />
          <Renderer />
        </SplitPane>
      </div>
    );
  };
};
