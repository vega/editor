import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks.js';
import {currentPositionsSelector} from './layoutSlice.js';
import {selectedElementsSelector, setSelectedElements} from './selectionSlice.js';
import {setPopup} from './popupSlice.js';
import {CytoscapeControlled} from './CytoscapeControlled.js';
import {cytoscapeElementsSelector} from './runtimeSlice.js';

export function Cytoscape() {
  const dispatch = useDispatch();

  const elements = useAppSelector(cytoscapeElementsSelector);
  const positions = useAppSelector(currentPositionsSelector);
  const selected = useAppSelector(selectedElementsSelector);

  const onSelect = React.useCallback((el) => dispatch(setSelectedElements(el)), [dispatch]);
  const onHover = React.useCallback((target) => dispatch(setPopup(target)), [dispatch]);

  return (
    <CytoscapeControlled
      elements={elements}
      positions={positions}
      selected={selected}
      onSelect={onSelect}
      onHover={onHover}
    />
  );
}
