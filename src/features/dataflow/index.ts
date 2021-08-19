import {AnyAction} from '@reduxjs/toolkit';
import {State} from '../../constants/default-state';

import {pulsesSlice} from './pulsesSlice';

// Since we are using a number of pulses defined here with the rest of the global redux state
// we need a few custom functions to combine these reducers and state types, to integrate
// them into the rest of the redux state.

const slices = [pulsesSlice] as const;

/**
 * Combines the slicers reducers manually, to account for leaving the rest
 * of the global reducer unchanged.
 */
export function dataflowReducer(state: State, action: AnyAction): State {
  let stateChanged = false;
  const changedStates = {};
  for (const slice of slices) {
    const previousState = state[slice.name];
    const nextState = slice.reducer(previousState, action);
    if (nextState !== previousState) {
      changedStates[slice.name] = nextState;
      stateChanged = true;
    }
  }
  return stateChanged ? {...state, ...changedStates} : state;
}


type DataflowState = {
  [Slice in (typeof slices)[number] as Slice['name']]: ReturnType<Slice['reducer']>
}
export const dataflowInitialState = Object.fromEntries(slices.map((s) => [s.name, undefined])) as DataflowState;
