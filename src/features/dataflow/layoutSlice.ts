/**
 * Computes layouts for graphs with ELK js and caches them.
 */
import {resetPulses} from './pulsesSlice';
import {runtimeSelector, setRuntime} from './runtimeSlice';
import {filteredGraphSelector, selectionSelector} from './selectionSlice';
import {toELKGraph} from './utils/toELKGraph';
import {ElkNode} from 'elkjs';
import ELK from 'elkjs/lib/elk-api';
import {State} from '../../constants/default-state';
import {deepEqual} from 'vega-lite';
import {createAsyncThunk, createSelector, createSlice, SerializedError} from '@reduxjs/toolkit';
import {createSliceSelector} from './utils/createSliceSelector';
import {Dispatch} from 'redux';

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

// We copy the ELK worker file to the webpack build as is, from the ELK package, so we can load it as a webworker.

const elkWorker = new Worker('./elk-worker.js');
const elk = new ELK({
  workerFactory: () => elkWorker,
});

const computeLayout = createAsyncThunk(
  'computeLayout',
  async ({node}: {node: ElkNode; key: LayoutKey}): Promise<ElkNode> => {
    // If we encounter an error, log to console as well as raising to set state
    try {
      return elk.layout(node);
    } catch (error) {
      console.warn('Error laying out with ELK', {node, error});
      throw error;
    }
  }
);

/**
 * Wraps compute layout dispatch in conditional to first check if we are already computing.
 *
 * We use this over setting the condition on creatAsyncThunk, so that elkGraphSelector
 * errors are not caught
 */
export function conditionallyComputeLayout(key: LayoutKey) {
  return (dispatch: Dispatch<any>, getState: () => State) => {
    const alreadyLayingOut = currentLayoutStatusSelector(getState()) !== null;
    if (alreadyLayingOut) {
      return;
    }
    // Use selector inside thunk, to delay resolving it till we have passed the condition,
    // Because resolving selector is potentially expensive, requires full graph traversal
    const node = elkGraphSelector(key);
    return dispatch(computeLayout({node, key}));
  };
}

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
          key: action.meta.arg.key,
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
export const elkGraphSelector = createSelector(filteredGraphSelector, (graph) =>
  graph === null ? null : toELKGraph(graph)
);
export const currentLayoutSelector = createSelector(currentLayoutStatusSelector, (status) => status?.value || null);
export const elkGraphWithPositionSelector = createSelector(currentLayoutSelector, (value) =>
  value?.type === 'done' ? value.layout : null
);
