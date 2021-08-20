import {createAction, createSlice} from '@reduxjs/toolkit';
import {State} from '../../constants/default-state';
import {setRuntime} from './runtimeSlice';
import {SanitizedValue, sanitizeValue} from './sanitizeValue';

export type Values = Record<string, SanitizedValue>;
export type Pulse = {clock: number; values: Values};
export type PulsesState = Pulse[];
const initialState: PulsesState = [];

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
        state.push(payload);
      }),
});

// Sort pulses by clock
export const selectPulses = (state: State) => [...state.pulses].sort((l, r) => r.clock - l.clock);
