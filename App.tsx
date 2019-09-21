import React, { useState } from 'react';
import ObjectViewer from 'react-json-view';
import './App.css';
import { exportScene } from './scenegraph';
import { view2dot } from './vega2dot';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render';
import { View } from 'vega-typings';
import { VegaWrapper } from './VegaWrapper';

const viz = new Viz({ Module, render });

const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [view, setView] = useState<View | null>(null);
  const [sceneGraph, setSceneGraph] = useState<object>({});
  const [dataFlow, setDataFlow] = useState<SVGSVGElement | null>(null);

  const updateDisplay = (): void => {
    if (view !== null) {
      const internalSceneGraph = (view as any)['_scenegraph'];
      setSceneGraph(exportScene(internalSceneGraph.root));
      viz.renderSVGElement(view2dot(view)).then(el => {
        setDataFlow(el);
      });
    }
  };

  return (
    <div className="App">
      <div className="app-left">
        <div className="app-left-top">
          <button onClick={updateDisplay}>Visualize</button>
          <ObjectViewer src={sceneGraph} />
        </div>
        <div className="app-left-bottom">
          {dataFlow === null ? (
            <p>No graph available</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: dataFlow.outerHTML }}></div>
          )}
        </div>
      </div>
      <div className="app-right">
        <VegaWrapper
          onNewView={(view): void => {
            console.log('A new view was created');
            setView(view);
          }}
        />
      </div>
    </div>
  );
};

export default App;
