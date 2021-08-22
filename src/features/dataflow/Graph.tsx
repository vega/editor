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
  const layout = useAppSelector(currentLayoutSelector);

  const layingOut = <div className="overlay">Laying out graph...</div>;
  // If we haven't started laying out this graph yet, just default to saying laying out.
  if (layout === null) {
    return layingOut;
  }
  switch (layout.type) {
    case 'loading':
      return layingOut;
    case 'done':
      return <></>;
    case 'error':
      return <div className="overlay">Error laying out graph: {layout.error}</div>;
  }
}

function Cytoscape() {
  const layout = useAppSelector(currentLayoutSelector);
  return <pre>{JSON.stringify(layout ?? null, undefined, 2)}</pre>;
}
