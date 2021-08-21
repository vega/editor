import {createAction, createSelector, createSlice} from '@reduxjs/toolkit';
import {setRuntime} from './runtimeSlice';
import {createSliceSelector} from './utils/createSliceSelector';
import {SanitizedValue, sanitizeValue} from './utils/sanitizeValue';

export type Values = Record<string, SanitizedValue>;
export type Pulse = {clock: number; values: Values; nValues: number};
export type PulsesState = Pulse[];
const initialState: PulsesState = [];

// Trim stored pulses to this maximum. If new pulses are recorded past this, drop them
const MAX_PULSES = 100;

export const recordPulse = createAction('recordPulse', (clock: number, values: Record<string, unknown>) => ({
  payload: {
    clock,
    values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, sanitizeValue(v)])),
  },
}));

export const resetPulses = createAction<void>('resetPulses');

export const pulsesSlice = createSlice({
  name: 'pulses',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(setRuntime, () => initialState)
      .addCase(resetPulses, () => initialState)
      .addCase(recordPulse, (state, {payload}) => {
        if (state.length > MAX_PULSES) {
          state.shift();
        }
        state.push({...payload, nValues: Object.keys(payload.values).length});
      }),
});

export const pulsesSelector = createSliceSelector(pulsesSlice);
// Sort pulses by clock, by reversing them
export const sortedPulsesSelector = createSelector(pulsesSelector, (pulses) => pulses.slice(0).reverse());
export const pulsesEmptySelector = createSelector(pulsesSelector, (pulses) => pulses.length === 0);
