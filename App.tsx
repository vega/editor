import React, { useState } from 'react';
import { sceneToJSON } from 'vega-scenegraph/src/util/serialize';
import { Vega } from 'react-vega';
import { chartData, chartSpec } from './chart';
import ObjectViewer from 'react-json-view';
import './App.css';
import { pull } from './scenegraph';

const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scene, setScene] = useState<object>({});
  const [dataFlow, setDataFlow] = useState<object>({});
  const [doVisualize, setDoVisualize] = useState(false);
  return (
    <div className="App">
      <div className="app-left">
        <div className="app-left-top">
          <button onClick={() => setDoVisualize(true)}>Visualize</button>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          <ObjectViewer src={scene!} />
        </div>
        <div className="app-left-bottom"></div>
      </div>
      <div className="app-right">
        <div className="vega-wrapper">
          <Vega
            spec={chartSpec}
            data={chartData}
            width={chartSpec.width}
            height={chartSpec.height}
            renderer="svg"
            actions={false}
            onNewView={(view): {} => {
              if (doVisualize) {
                const sg = (view as any)['scenegraph']();
                const ssg = sceneToJSON(sg.root, 2);
                setScene(JSON.parse(ssg));
                setDoVisualize(false);
              }
              return {};
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
