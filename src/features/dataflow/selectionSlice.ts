import {createAction, createSlice, createSelector} from '@reduxjs/toolkit';
import {graphSelector, setRuntime} from './runtimeSlice';
import {resetPulses, pulsesSelector} from './pulsesSlice';
import {allRelated} from './utils/allRelated';
import {associatedWith, filterEdges, intersectIDs, GraphType, types} from './utils/graph';
import {createSliceSelector} from './utils/createSliceSelector';
import {mapValues} from './utils/mapValues';

export type Elements = {nodes: string[]; edges: string[]};
export type SelectionState = {
  pulse: number | null;
  elements: Elements | null;
  types: {[Type in GraphType]: boolean};
};

const initialState: SelectionState = {pulse: null, elements: null, types: mapValues(types, (props) => props.default)};

export const setSelectedPulse = createAction<number | null>('setSelectedPulse');
export const setSelectedElements = createAction<Elements | null>('setSelectedElements');
export const setSelectedType = createAction<{type: GraphType; enabled: boolean}>('setSelectedType');

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
        // Sort them, to aid in easy equality checking
        state.elements =
          payload === null ? null : {nodes: payload.nodes.slice().sort(), edges: payload.edges.slice().sort()};
      })
      .addCase(setSelectedType, (state, {payload}) => {
        state.types[payload.type] = payload.enabled;
      }),
});

export const selectionSelector = createSliceSelector(selectionSlice);
export const selectedPulseSelector = createSelector(selectionSelector, (state) => state.pulse);
export const selectedElementsSelector = createSelector(selectionSelector, (state) => state.elements);
export const selectedTypesSelector = createSelector(selectionSelector, (state) => state.types);

/**
 * Whether an element is selected.
 */
export const elementsSelectedSelector = createSelector(selectedElementsSelector, (selected) => selected !== null);

export const selectedValuesSelector = createSelector(pulsesSelector, selectedPulseSelector, (pulses, selected) =>
  selected === null ? null : pulses.find((p) => p.clock === selected).values
);

// The nodes that are filtered based on the selector pulse
export const visibleNodesFromPulseSelector = createSelector(graphSelector, selectedValuesSelector, (graph, values) =>
  values === null || graph === null ? null : associatedWith(graph, Object.keys(values))
);

// The nodes that are filtered based on the selected elements
export const visibleNodesFromElementsSelector = createSelector(
  graphSelector,
  selectedElementsSelector,
  (graph, elements) => (elements === null || graph === null ? null : allRelated(graph, elements))
);

export const visibleNodesFromTypesSelector = createSelector(
  graphSelector,
  selectedTypesSelector,
  (graph, selectedTypes) =>
    graph === null
      ? null
      : new Set(
          Object.entries(graph.nodes)
            .filter(([, {type}]) => selectedTypes[type])
            .map(([id]) => id)
        )
);

// The intersection of all the selected nodes, or null if empty
export const visibleNodesSelector = createSelector(
  visibleNodesFromPulseSelector,
  visibleNodesFromElementsSelector,
  visibleNodesFromTypesSelector,
  intersectIDs
);

export const filteredEdgesSelector = createSelector(graphSelector, visibleNodesSelector, (graph, nodes) =>
  nodes === null || graph === null ? null : filterEdges(graph, nodes)
);

export type VisibleElements = {nodes: Set<string>; edges: Set<string>};

export const visibleElementsSelector = createSelector(visibleNodesSelector, filteredEdgesSelector, (nodes, edges) =>
  nodes === null
    ? null
    : ({
        nodes,
        edges,
      } as VisibleElements)
);
