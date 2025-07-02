import * as React from 'react';
import {Cytoscape} from './Cytoscape.js';
import {Popup} from './Popup.js';
import './Graph.css';
import {useAppContext} from '../../context/app-context.js';
import {useMemo} from 'react';

export function Graph() {
  const cytoscape = useMemo(() => <Cytoscape />, []);
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
  const {state, setState} = useAppContext();
  const elementsSelected = state.elementsSelected;
  return (
    <button
      className="unselect-elements"
      onClick={() => setState((s) => ({...s, elementsSelected: null}))}
      disabled={!elementsSelected}
    >
      Unselect elements
    </button>
  );
}

function Overlay() {
  const {state} = useAppContext();
  const layout = state.layout;

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
