import React, { useState } from 'react';
import { Inspector } from 'react-inspector';
import { View } from 'vega-typings';
import './App.css';
import GraphvizDisplay from './GraphvizDisplay';
import { exportScene } from './scenegraph';
import { view2dot } from './vega2dot';
import { VegaWrapper } from './VegaWrapper';

const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [view, setView] = useState<View | null>(null);
  const [sceneGraph, setSceneGraph] = useState<object>({});
  const [dataFlow, setDataFlow] = useState<string | null>(null);

  const updateDisplay = (): void => {
    if (view !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internalSceneGraph = (view as any)['_scenegraph'];
      setDataFlow(view2dot(view));
      setSceneGraph(exportScene(internalSceneGraph.root));
    }
  };

  return (
    <div className="App">
      <div className="app-left">
        <div className="app-left-top">
          <button onClick={updateDisplay}>Visualize</button>
          <Inspector data={sceneGraph} expandLevel={5} />
        </div>
        <div className="app-left-bottom">
          {dataFlow === null ? (
            <p>Click Visualize to show data flow graph here</p>
          ) : (
            <GraphvizDisplay source={dataFlow} />
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
