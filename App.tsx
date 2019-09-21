import React, { useState } from 'react';
import { sceneToJSON } from 'vega-scenegraph/src/util/serialize';
import { Vega } from 'react-vega';
import { chartData, chartSpec } from './chart';
import ObjectViewer from 'react-json-view';
import './App.css';
import { pull } from './scenegraph';
import { view2dot } from './vega2dot';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render';

const viz = new Viz({ Module, render });

const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scene, setScene] = useState<object>({});
  const [dataFlow, setDataFlow] = useState<SVGSVGElement | null>(null);
  const [doVisualize, setDoVisualize] = useState(false);
  return (
    <div className="App">
      <div className="app-left">
        <div className="app-left-top">
          <button onClick={() => setDoVisualize(true)}>Visualize</button>
          <ObjectViewer src={scene!} />
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
                viz.renderSVGElement(view2dot(view)).then(el => {
                  setDataFlow(el);
                });
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
