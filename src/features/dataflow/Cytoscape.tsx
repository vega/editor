import * as React from 'react';
import {useDataflowActions, useDataflowComputed, useDataflowState} from './DataflowContext.js';
import {CytoscapeControlled} from './CytoscapeControlled.js';

export function Cytoscape() {
  const {cytoscapeElements, currentPositions, selectedElements} = useDataflowComputed();
  const {setSelectedElements, setPopup} = useDataflowActions();

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
