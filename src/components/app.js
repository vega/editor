import React from 'react';
import SpecEditor from './spec-editor';
import Renderer from './renderer';

export default class App extends React.Component {
  render () {
    return (
      <div>
        <SpecEditor />
        <Renderer />
      </div>
    );
  };
};
