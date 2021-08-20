import {createAction, createSlice} from '@reduxjs/toolkit';
import {setRuntime} from './runtimeSlice';
import {resetPulses, selectPulses} from './pulsesSlice';
import {State} from '../../constants/default-state';

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

export const selectSelectedPulse = (state: State) => state.selection.pulse;
export const selectSelectedValues = (state: State) =>
  selectPulses(state).find((p) => p.clock === selectSelectedPulse(state))?.values || null;
