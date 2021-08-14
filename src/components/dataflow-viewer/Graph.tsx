import * as React from 'react';
import Cytoscape from './Cytoscape';
import {Dispatch} from './reducer';

export default function Graph({dispatch, layoutRunning}: {dispatch: Dispatch; layoutRunning: boolean}) {
  // Memoize cytoscape component so it only renders once
  const cytoscape = React.useMemo(() => <Cytoscape dispatch={dispatch} />, [dispatch]);
  return (
    <div className="graph">
      <div className={layoutRunning ? 'overlay' : 'display-none'}>Laying out graph...</div>
      {cytoscape}
    </div>
  );
}
