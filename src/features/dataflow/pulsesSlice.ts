import {createAction, createSlice} from '@reduxjs/toolkit';
import {State} from '../../constants/default-state';
import {SanitizedValue, sanitizeValue} from './sanitizeValue';

export type Values = Record<string, SanitizedValue>;
export type Pulse = {clock: number; values: Values};
export type PulsesState = {value: Pulse[]; selected: number | null};
const initialState: PulsesState = {value: [], selected: null};

export const recordPulse = createAction('recordPulse', (clock: number, values: Record<string, unknown>) => ({
  payload: {
    clock,
    values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, sanitizeValue(v)])),
  },
}));

export const resetPulses = createAction<void>('resetPulses');
export const selectPulse = createAction<number | null>('selectPulse');

export const pulsesSlice = createSlice({
  name: 'pulses',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(recordPulse, (state, {payload}) => {
        state.value.push(payload);
      })
      .addCase(resetPulses, (state) => {
        state.value = [];
        state.selected = null;
      })
      .addCase(selectPulse, (state, action) => {
        state.selected = action.payload;
      }),
});

// Sort pulses by clock
export const selectPulses = (state: State) => [...state.pulses.value].sort((l, r) => r.clock - l.clock);
export const selectSelectedPulse = (state: State) => state.pulses.selected;
export const selectSelectedValues = (state: State) =>
  selectPulses(state).find((p) => p.clock === selectSelectedPulse(state))?.values || null;

export const slices = [pulsesSlice];
