import {createAction, createSlice, createSelector} from '@reduxjs/toolkit';
import {graphSelector, setRuntime} from './runtimeSlice';
import {resetPulses, pulsesSelector} from './pulsesSlice';
import {State} from '../../constants/default-state';
import {allRelated} from './utils/allRelated';
import {associatedWith, filterGraph, intersectIDs} from './utils/graph';

export type Elements = {nodes: string[]; edges: string[]};
type SelectionState = {pulse: number | null; elements: Elements | null};
const initialState: SelectionState = {pulse: null, elements: null};

export const setSelectedPulse = createAction<number | null>('setSelectedPulse');
export const setSelectedElements = createAction<Elements | null>('setSelectedElements');

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(setRuntime, () => initialState)
      .addCase(resetPulses, (state) => {
        state.pulse = null;
      })
      .addCase(setSelectedPulse, (state, {payload}) => {
        state.pulse = payload;
      })
      .addCase(setSelectedElements, (state, {payload}) => {
        state.elements = payload;
      }),
});

export const selectedPulseSelector = (state: State) => state.selection.pulse;
export const selectedElementsSelector = (state: State) => state.selection.elements;

export const selectedValuesSelector = createSelector(pulsesSelector, selectedPulseSelector, (pulses, selected) =>
  selected === null ? null : pulses.find((p) => p.clock === selected).values
);

// The nodes that are filtered based on the selector pulse
export const filteredNodesFromPulseSelector = createSelector(graphSelector, selectedValuesSelector, (graph, values) =>
  values === null || graph === null ? null : associatedWith(graph, Object.keys(values))
);

// The nodes that are filtered based on the selected elements
export const filteredNodesFromElementsSelector = createSelector(
  graphSelector,
  selectedElementsSelector,
  (graph, elements) => (elements === null || graph === null ? null : allRelated(graph, elements))
);

// The intersection of all the selected nodes, or null if empty
export const filteredNodesSelector = createSelector(
  filteredNodesFromPulseSelector,
  filteredNodesFromElementsSelector,
  (fromPulse, fromElements) => intersectIDs(fromPulse, fromElements)
);

export const filteredGraphSelector = createSelector(graphSelector, filteredNodesSelector, (graph, nodes) =>
  nodes === null || graph === null ? graph : filterGraph(graph, nodes)
);
