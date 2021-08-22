/**
 * Computes layouts for graphs with ELK js and caches them.
 */
import {resetPulses} from './pulsesSlice';
import {graphSelector, runtimeSelector, setRuntime} from './runtimeSlice';
import {selectionSelector} from './selectionSlice';
import {measureText} from './utils/measureText';
import {toELKGraph} from './utils/elk';
import {ElkNode} from 'elkjs';
import ELK from 'elkjs/lib/elk.bundled.js';
import {State} from '../../constants/default-state';
import {deepEqual} from 'vega-lite';
import {createAsyncThunk, createSelector, createSlice, SerializedError} from '@reduxjs/toolkit';
import {createSliceSelector} from './utils/createSliceSelector';

// Mapping of action request ID to computed layout, keyed by the selection and runtime
// We keep the runtime as a key, even though we clear all values after changing the runtime,
// so that late returning layouts will be keyed with previous runtime and wont be used
type LayoutKey = Pick<State, 'selection' | 'runtime'>;
type LayoutValue = {type: 'done'; layout: ElkNode} | {type: 'loading'} | {type: 'error'; error: SerializedError};
type LayoutStatus = {
  key: LayoutKey;
  value: LayoutValue;
};
type LayoutState = Record<string, LayoutStatus>;

const initialState: LayoutState = {};
const elk = new ELK();

export const computeLayout = createAsyncThunk<ElkNode, LayoutKey, {state: State}>(
  'computeLayout',
  async (key) => {
    // Use selector inside thunk, to delay resolving it till we have passed the condition,
    // Because resolving selector is potentially expensive, requires full graph traversal
    const node = elkGraphSelector(key);
    return await elk.layout(node);
  },
  {
    // If layout already is being computed, don't recompute
    condition: (_elkGraph, {getState}) => currentLayoutStatusSelector(getState()) === null,
  }
);

// TODO: Layout based on included nodes instead?
// Use set to track?

// Then add cytoscape JS conversion ;)

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {},
  // Avoid returning builder to prevent cyclical types
  // https://github.com/reduxjs/redux-toolkit/issues/324#issuecomment-615391051
  extraReducers: (builder) => {
    builder
      .addCase(setRuntime, () => ({}))
      .addCase(resetPulses, (state) => {
        // Remove caches for existing pulse layouts, when reseting pulses
        for (const [requestID, layoutStatus] of Object.entries(state)) {
          if (layoutStatus.key.selection.pulse !== null) {
            delete state[requestID];
          }
        }
      })
      .addCase(computeLayout.pending, (state, action) => {
        state[action.meta.requestId] = {
          value: {type: 'loading'},
          key: action.meta.arg,
        };
      })
      .addCase(computeLayout.fulfilled, (state, action) => {
        state[action.meta.requestId].value = {layout: action.payload, type: 'done'};
      })
      .addCase(computeLayout.rejected, (state, action) => {
        state[action.meta.requestId].value = {type: 'error', error: action.error};
      });
  },
});

const layoutSelector = createSliceSelector(layoutSlice);

export const layoutKeySelector = createSelector(selectionSelector, runtimeSelector, (selection, runtime) => ({
  selection,
  runtime,
}));

const currentLayoutStatusSelector = createSelector(
  layoutSelector,
  layoutKeySelector,
  (layout, {selection, runtime}) =>
    // Compare runtime by identity, to speed up comparison
    Object.values(layout).find(({key}) => runtime === key.runtime && deepEqual(selection, key.selection)) ?? null
);

export const currentLayoutSelector = createSelector(currentLayoutStatusSelector, (status) => status?.value || null);

export const elkGraphSelector = createSelector(graphSelector, (graph) => (graph === null ? null : toELKGraph(graph)));
