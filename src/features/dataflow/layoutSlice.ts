/**
 * Computes layouts for graphs with ELK js and caches them.
 */
import {resetPulses} from './pulsesSlice';
import {graphSelector, setRuntime} from './runtimeSlice';
import {visibleElementsSelector, VisibleElements, visibleNodesSelector} from './selectionSlice';
import {toELKGraph} from './utils/toELKGraph';
import {ElkNode} from 'elkjs';
import ELK from 'elkjs/lib/elk-api';
import {State} from '../../constants/default-state';
import {deepEqual} from 'vega-lite';
import {createAsyncThunk, createSelector, createSlice, SerializedError} from '@reduxjs/toolkit';
import {createSliceSelector} from './utils/createSliceSelector';
import {useAppSelector} from '../../hooks';
import {useDispatch} from 'react-redux';
import * as React from 'react';
import {Graph} from './utils/graph';
import {ELKToPositions} from './utils/ELKToPositions';

// Mapping of action request ID to computed layout, keyed by the visible nodes and runtime

// We keep the graph as a key, even though we clear all values after changing the runtime,
// so that late returning layouts will be keyed with previous graph and wont be used
type LayoutKey = {graph: Graph | null; visibleNodes: Set<string> | null};
type Positions = Record<string, {x: number; y: number}>;
type LayoutValue = {type: 'done'; positions: Positions} | {type: 'loading'} | {type: 'error'; error: SerializedError};
type LayoutStatus = {
  key: LayoutKey;
  value: LayoutValue;
};
type LayoutState = Record<string, LayoutStatus>;

const initialState: LayoutState = {};

// We copy the ELK worker file to the webpack build as is, from the ELK package, so we can load it as a webworker.

const elkWorker = new Worker('./elk-worker.js');
const elk = new ELK({
  workerFactory: () => elkWorker,
});

const computeLayout = createAsyncThunk<
  ElkNode,
  ElkNode,
  {state: State; pendingMeta: {requestId: string; key: LayoutKey}}
>('computeLayout', (node) => elk.layout(node), {
  // Add key to pending metadata
  getPendingMeta: ({requestId}, {getState}) => ({requestId, key: currentLayoutKeySelector(getState())}),
});

/**
 * Try recomputing layout, when either runtime or selections change
 */
export function useRecomputeLayout() {
  const dispatch = useDispatch();
  const elkGraph = useAppSelector(elkGraphSelector);

  // Compute the layout for the current selections the graph loads
  React.useEffect(() => {
    dispatch(computeLayout(elkGraph));
  }, [elkGraph]);
}

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {},
  // Avoid returning builder to prevent cyclical types
  // https://github.com/reduxjs/redux-toolkit/issues/324#issuecomment-615391051
  extraReducers: (builder) => {
    builder
      .addCase(setRuntime, () => initialState)
      .addCase(resetPulses, () => initialState)
      .addCase(computeLayout.pending, (state, action) => {
        state[action.meta.requestId] = {
          value: {type: 'loading'},
          key: action.meta.key,
        };
      })
      .addCase(computeLayout.fulfilled, (state, action) => {
        state[action.meta.requestId].value = {positions: ELKToPositions(action.payload), type: 'done'};
      })
      .addCase(computeLayout.rejected, (state, action) => {
        state[action.meta.requestId].value = {type: 'error', error: action.error};
      });
  },
});

const layoutSelector = createSliceSelector(layoutSlice);

const elkGraphSelector = createSelector(graphSelector, visibleElementsSelector, (graph, visible) =>
  graph === null ? null : toELKGraph(graph, visible)
);

const currentLayoutKeySelector = createSelector(graphSelector, visibleNodesSelector, (graph, visibleNodes) => ({
  graph,
  visibleNodes,
}));

const currentLayoutStatusSelector = createSelector(
  layoutSelector,
  currentLayoutKeySelector,
  (layout, {graph, visibleNodes}) =>
    // Compare graph by identity, to speed up comparison
    Object.values(layout).find(({key}) => graph === key.graph && deepEqual(visibleNodes, key.visibleNodes)) ?? null
);

export const currentLayoutSelector = createSelector(currentLayoutStatusSelector, (status) => status?.value ?? null);
export const currentPositionsSelector = createSelector(currentLayoutSelector, (value) =>
  value?.type === 'done' ? value.positions : null
);
