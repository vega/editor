import {Slice} from '@reduxjs/toolkit';

/**
 * Type slice selectors conservatively, so they only require the part of the state that is relevant to the slice.
 */
export function createSliceSelector<S extends Slice>(
  slice: S
): (state: {[key in SliceName<S>]: SliceState<S>}) => SliceState<S> {
  return (state) => state[slice.name];
}

type SliceName<S extends Slice> = S['name'];
type SliceState<S extends Slice> = ReturnType<S['reducer']>;
