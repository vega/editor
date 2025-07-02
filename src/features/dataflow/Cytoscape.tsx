import {useCallback, useMemo} from 'react';
import {useAppContext} from '../../context/app-context.js';
import {useCurrentPositions} from './LayoutProvider.js';
import {usePopupDispatch} from './PopupProvider.js';
import {CytoscapeControlled} from './CytoscapeControlled.js';
import {toCytoscape} from './utils/toCytoscape.js';
import {runtimeToGraph} from './utils/runtimeToGraph.js';
import * as React from 'react';

export function Cytoscape() {
  const {state, setState} = useAppContext();
  const {runtime, elementsSelected} = state;

  const graph = useMemo(() => (runtime ? runtimeToGraph(runtime) : null), [runtime]);
  const elements = useMemo(() => (graph ? toCytoscape(graph) : null), [graph]);

  const positions = useCurrentPositions();

  const onSelect = useCallback((el) => setState((s) => ({...s, elementsSelected: el})), [setState]);
  const popupDispatch = usePopupDispatch();

  const onHover = useCallback((target) => popupDispatch({type: 'SET_POPUP', payload: target}), [popupDispatch]);

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
