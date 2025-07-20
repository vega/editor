import * as React from 'react';
import {useDataflowActions, useDataflowComputed} from './DataflowContext.js';
import {Cytoscape} from './Cytoscape.js';
import {Popup} from './Popup.js';
import './Graph.css';

export function Graph() {
  const {currentLayout, elementsSelected} = useDataflowComputed();
  const {setSelectedElements, computeLayout} = useDataflowActions();

  // Trigger starting the async layout computation, when this node is rendered
  React.useEffect(() => {
    computeLayout();
  }, [computeLayout]);

  const cytoscape = React.useMemo(() => <Cytoscape />, []);
  return (
    <div className="graph">
      <UnselectElements />
      <Overlay />
      <Popup />
      {cytoscape}
    </div>
  );
}

function UnselectElements() {
  const {elementsSelected} = useDataflowComputed();
  const {setSelectedElements} = useDataflowActions();
  return (
    <button className="unselect-elements" onClick={() => setSelectedElements(null)} disabled={!elementsSelected}>
      Unselect elements
    </button>
  );
}

function Overlay() {
  const {currentLayout} = useDataflowComputed();

  if (currentLayout === null) {
    return <div className="overlay center-text">No active dataflow runtime</div>;
  }
  switch (currentLayout.type) {
    case 'loading':
      return <div className="overlay center-text">Laying out graph...</div>;
    case 'done':
      return <></>;
    case 'error':
      return (
        <div className="overlay">
          <h2>Encountered an error running ELK layout:</h2>
          <pre>{currentLayout.error.stack}</pre>
        </div>
      );
  }
}
