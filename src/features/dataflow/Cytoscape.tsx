import cytoscape from 'cytoscape';
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {currentPositionsSelector} from './layoutSlice';
import {setSelectedElements, visibleElementsSelector} from './selectionSlice';
import {setPopup} from './popupSlice';
import {CytoscapeControlled} from './CytoscapeControlled';
import {graphSelector} from './runtimeSlice';
import {Graph} from './utils/graph';

export function Cytoscape() {
  const dispatch = useDispatch();
  const graph = useAppSelector(graphSelector);
  const elements = React.useMemo(() => (graph === null ? null : toCytoscape(graph)), [graph]);
  const positions = useSelector(currentPositionsSelector);
  const visibleElements = useSelector(visibleElementsSelector);

  return (
    <CytoscapeControlled
      elements={elements}
      visible={visibleElements}
      positions={positions}
      onSelect={(elements) => dispatch(setSelectedElements(elements))}
      onHover={(target) => dispatch(setPopup(target))}
    />
  );
}

function toCytoscape(graph: Graph): cytoscape.ElementsDefinition {
  // Keep a mapping of all IDs so we can add their position when traversing the ELK graph
  const nodes = Object.entries(graph.nodes).map(([id, {parent, label, colorKey, size}]) => ({
    data: {id, parent, label, colorKey, ...size},
  }));

  const edges = Object.entries(graph.edges).map(([id, {source, target, primary}]) => ({
    data: {
      id,
      source,
      target,
      primary: primary.toString(),
    },
  }));
  return {nodes, edges};
}
