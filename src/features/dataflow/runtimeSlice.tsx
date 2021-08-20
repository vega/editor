import {createAction, createSlice} from '@reduxjs/toolkit';
import {Runtime} from 'vega-typings/types';

export type RuntimeState = Runtime | null;
const initialState: RuntimeState = null;

export const setRuntime = createAction<Runtime>('setRuntime');

export const runtimeSlice = createSlice({
  name: 'runtime',
  initialState,
  reducers: {},
  extraReducers: (builder) => builder.addCase(setRuntime, (_state, {payload}) => payload),
});
