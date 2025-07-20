import * as React from 'react';
import {useDataflow} from './DataflowContext.js';
import {CytoscapeControlled} from './CytoscapeControlled.js';

export function Cytoscape() {
  const {cytoscapeElements, currentPositions, selectedElements, setSelectedElements, setPopup} = useDataflow();

  const onSelect = React.useCallback((el) => setSelectedElements(el), [setSelectedElements]);
  const onHover = React.useCallback((target) => setPopup(target), [setPopup]);

  return (
    <CytoscapeControlled
      elements={cytoscapeElements}
      positions={currentPositions}
      selected={selectedElements}
      onSelect={onSelect}
      onHover={onHover}
    />
  );
}
