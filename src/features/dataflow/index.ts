import {AnyAction} from '@reduxjs/toolkit';
import {State} from '../../constants/default-state.js';

import {pulsesSlice} from './pulsesSlice.js';
import {runtimeSlice} from './runtimeSlice.js';
import {selectionSlice} from './selectionSlice.js';
import {layoutSlice} from './layoutSlice.js';
import {popupSlice} from './popupSlice.js';

// Since we are using a number of pulses defined here with the rest of the global redux state
// we need a few custom functions to combine these reducers and state types, to integrate
// them into the rest of the redux state.

const slices = [pulsesSlice, runtimeSlice, selectionSlice, layoutSlice, popupSlice] as const;
type SliceType = (typeof slices)[number];
/**
 * Combines the slicers reducers manually, to account for leaving the rest
 * of the global reducer unchanged.
 */
export function dataflowReducer(state: State, action: AnyAction): State {
  const [changedStates, stateChanged] = slices.reduce(
    (prevValue, slice) => {
      const previousState = state[slice.name];
      const nextState = slice.reducer(previousState as any, action);
      if (nextState === previousState) {
        return prevValue;
      }
      return [{...prevValue[0], [slice.name]: nextState}, true];
    },
    [[], false],
  );

  return stateChanged ? {...state, ...changedStates} : state;
}

type DataflowState = {
  [Slice in SliceType as Slice['name']]: ReturnType<Slice['reducer']>;
};
export const dataflowInitialState = Object.fromEntries(slices.map((s) => [s.name, undefined])) as DataflowState;
