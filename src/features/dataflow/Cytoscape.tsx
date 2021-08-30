import * as React from 'react';
import {useDispatch} from 'react-redux';
import {useAppSelector} from '../../hooks';
import {currentPositionsSelector} from './layoutSlice';
import {setSelectedElements} from './selectionSlice';
import {setPopup} from './popupSlice';
import {CytoscapeControlled} from './CytoscapeControlled';
import {cytoscapeElementsSelector} from './runtimeSlice';

export function Cytoscape() {
  const dispatch = useDispatch();
  const elements = useAppSelector(cytoscapeElementsSelector);
  const positions = useAppSelector(currentPositionsSelector);
  const onSelect = React.useCallback((elements) => dispatch(setSelectedElements(elements)), [dispatch]);
  const onHover = React.useCallback((target) => dispatch(setPopup(target)), [dispatch]);

  return <CytoscapeControlled elements={elements} positions={positions} onSelect={onSelect} onHover={onHover} />;
}
