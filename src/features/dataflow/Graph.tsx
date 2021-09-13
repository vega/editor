import * as React from 'react';
import {useAppSelector} from '../../hooks';
import {currentLayoutSelector, useRecomputeLayout} from './layoutSlice';
import {Cytoscape} from './Cytoscape';
import {Popup} from './Popup';
import './Graph.css';

export function Graph() {
  useRecomputeLayout();
  const cytoscape = React.useMemo(() => <Cytoscape />, []);
  return (
    <div className="graph">
      <Overlay />
      <Popup />
      {cytoscape}
    </div>
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
