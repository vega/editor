import * as React from 'react';
import {useAppSelector} from '../../hooks';
import {currentLayoutSelector, useRecomputeLayout} from './layoutSlice';
import {Cytoscape} from './Cytoscape';
import {Popup} from './Popup';
import './Graph.css';
import {useDispatch} from 'react-redux';
import {elementsSelectedSelector, setSelectedElements} from './selectionSlice';

export function Graph() {
  // Trigger starting the async layout computation, when this node is rendered
  useRecomputeLayout();
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
  const dispatch = useDispatch();
  const elementsSelected = useAppSelector(elementsSelectedSelector);
  return (
    <button
      className="unselect-elements"
      onClick={() => dispatch(setSelectedElements(null))}
      disabled={!elementsSelected}
    >
      Unselect elements
    </button>
  );
}

function Overlay() {
  const layout = useAppSelector(currentLayoutSelector);

  if (layout === null) {
    return <div className="overlay center-text">No active dataflow runtime</div>;
  }
  switch (layout.type) {
    case 'loading':
      return <div className="overlay center-text">Laying out graph...</div>;
    case 'done':
      return <></>;
    case 'error':
      return (
        <div className="overlay">
          <h2>Encountered an error running ELK layout:</h2>
          <pre>{layout.error.stack}</pre>
        </div>
      );
  }
}
