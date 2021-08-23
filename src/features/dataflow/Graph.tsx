import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {currentLayoutSelector, layoutKeySelector, computeLayout} from './layoutSlice';
import {Cytoscape} from './Cytoscape';

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

  if (layout === null) {
    return <div className="overlay">No active dataflow runtime</div>;
  }
  switch (layout.type) {
    case 'loading':
      return <div className="overlay">Laying out graph...</div>;
    case 'done':
      return <></>;
    case 'error':
      return (
        <div>
          Error laying out graph
          <pre>{layout.error.stack}</pre>
        </div>
      );
  }
}
