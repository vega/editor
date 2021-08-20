import * as React from 'react';
import {useAppSelector} from '../../hooks';
import {filteredGraphSelector} from './selectionSlice';

export function Graph() {
  const cytoscape = React.useMemo(() => <Cytoscape />, []);
  return (
    <div className="graph">
      <Overlay />
      {cytoscape}
    </div>
  );
}

function Overlay() {
  //   const dataflowLoading = useAppSelector((state) => state.dataflowLoading);
  const dataflowLoading = false;
  return <div className={dataflowLoading ? 'overlay' : 'display-none'}>Laying out graph...</div>;
}

function Cytoscape() {
  const filteredGraph = useAppSelector(filteredGraphSelector);
  return <pre>{JSON.stringify(Object.fromEntries(filteredGraph.nodes.entries()), undefined, 2)}</pre>;
}
