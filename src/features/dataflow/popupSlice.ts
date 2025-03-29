import {createAction, createSelector, createSlice} from '@reduxjs/toolkit';
import {GetReferenceClientRect} from 'tippy.js';
import {graphSelector} from './runtimeSlice.js';
import {selectedValuesSelector} from './selectionSlice.js';
import {createSliceSelector} from './utils/createSliceSelector.js';

export type PopupState = null | {
  type: 'node' | 'edge';
  id: string;
  referenceClientRect: ReturnType<GetReferenceClientRect>;
};

export const setPopup = createAction<PopupState>('setPopup');

const initialState: PopupState = null;

export const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setPopup, (state, action) => action.payload);
  },
});

const popupSelector = createSliceSelector(popupSlice);

export const popupValueSelector = createSelector(
  popupSelector,
  graphSelector,
  selectedValuesSelector,
  (popup, graph, values) =>
    popup === null || graph === null
      ? null
      : popup.type === 'node'
        ? {
            node: graph.nodes[popup.id],
            value: values === null ? null : (values[popup.id] ?? null),
            ...popup,
            type: 'node' as const,
          }
        : {edge: graph.edges[popup.id], ...popup, type: 'edge' as const},
);
