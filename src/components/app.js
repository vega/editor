import React from 'react';
import SpecEditor from './spec-editor';
import Renderer from './renderer';
import {Responsive, WidthProvider} from 'react-grid-layout';
import './app.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class App extends React.Component {
  render () {
    const layouts = {
      lg: [{i: 'editor', x: 0, y: 0, w: 3, h: 2, isDraggable: true, isResizable: true}, {i: 'renderer', x: 3, y: 0, w: 9, h: 2, isDraggable: true, isResizable: true}]
    };

    return (
      <ResponsiveReactGridLayout className="layout" layouts={layouts}
        breakpoints={{lg: 0}}
        margin={[0, 0]}
        cols={{lg: 12}}>
        <div key='editor' style={{backgroundColor: 'red'}}>
          <SpecEditor />
        </div>
        <div key='renderer' style={{backgroundColor: 'orange'}}>
          <Renderer />
        </div>
      </ResponsiveReactGridLayout>
    );
  };
};
