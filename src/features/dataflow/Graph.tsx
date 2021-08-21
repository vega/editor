import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {currentLayoutSelector, layoutKeySelector, computeLayout} from './layoutSlice';

export function Graph() {
  const dispatch = useDispatch();
  const layoutKey = useAppSelector(layoutKeySelector);
  // Compute the layout for the current selections the graph loads
  React.useEffect(() => {
    dispatch(computeLayout(layoutKey));
  }, [layoutKey.runtime, layoutKey.selection]);

  const cytoscape = React.useMemo(() => <Cytoscape />, []);
  return (
    <div className="graph">
      <Overlay />
      {cytoscape}
    </div>
  );
}

function Overlay() {
  // When selectors change, start another layout, if not already started.

  //   const dataflowLoading = useAppSelector((state) => state.dataflowLoading);
  const dataflowLoading = false;
  return <div className={dataflowLoading ? 'overlay' : 'display-none'}>Laying out graph...</div>;
}

function Cytoscape() {
  const layout = useAppSelector(currentLayoutSelector);
  return <pre>{JSON.stringify(layout ?? null, undefined, 2)}</pre>;
}
