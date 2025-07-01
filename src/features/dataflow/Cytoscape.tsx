import * as React from 'react';
import {useAppContext} from '../../context/app-context.js';
import {useCurrentPositions} from './LayoutProvider.js';
import {usePopupDispatch} from './PopupProvider.js';
import {CytoscapeControlled} from './CytoscapeControlled.js';
import {toCytoscape} from './utils/toCytoscape.js';
import {runtimeToGraph} from './utils/runtimeToGraph.js';

export function Cytoscape() {
  const {state, setState} = useAppContext();
  const {runtime, elementsSelected} = state;

  const graph = React.useMemo(() => (runtime ? runtimeToGraph(runtime) : null), [runtime]);
  const elements = React.useMemo(() => (graph ? toCytoscape(graph) : null), [graph]);

  const positions = useCurrentPositions();

  const onSelect = React.useCallback((el) => setState((s) => ({...s, elementsSelected: el})), [setState]);
  const popupDispatch = usePopupDispatch();

  const onHover = React.useCallback((target) => popupDispatch({type: 'SET_POPUP', payload: target}), [popupDispatch]);

  return (
    <CytoscapeControlled
      elements={elements}
      positions={positions}
      selected={elementsSelected}
      onSelect={onSelect}
      onHover={onHover}
    />
  );
}
