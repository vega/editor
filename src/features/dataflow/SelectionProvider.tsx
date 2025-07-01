import * as React from 'react';
import {createContext, useContext, useReducer, useMemo} from 'react';
import {GraphType, types} from './utils/graph';
import {mapValues} from './utils/mapValues';

// State and Reducer
export type Elements = {nodes: string[]; edges: string[]};
export type SelectionState = {
  pulse: number | null;
  elements: Elements | null;
  types: {[Type in GraphType]: boolean};
};

const initialState: SelectionState = {
  pulse: null,
  elements: null,
  types: mapValues(types, (props) => props.default),
};

function selectionReducer(state: SelectionState, action: any): SelectionState {
  switch (action.type) {
    case 'SET_SELECTED_PULSE':
      return {...state, pulse: action.payload};
    case 'SET_SELECTED_ELEMENTS':
      return {...state, elements: action.payload};
    case 'SET_SELECTED_TYPE':
      return {...state, types: {...state.types, [action.payload.type]: action.payload.enabled}};
    case 'RESET_SELECTION':
      return initialState;
    default:
      return state;
  }
}

// Context
const SelectionStateContext = createContext<SelectionState | undefined>(undefined);
const SelectionDispatchContext = createContext<React.Dispatch<any> | undefined>(undefined);

// Provider
export function SelectionProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(selectionReducer, initialState);

  return (
    <SelectionStateContext.Provider value={state}>
      <SelectionDispatchContext.Provider value={dispatch}>{children}</SelectionDispatchContext.Provider>
    </SelectionStateContext.Provider>
  );
}

// Hooks
export function useSelectionState() {
  const context = useContext(SelectionStateContext);
  if (context === undefined) {
    throw new Error('useSelectionState must be used within a SelectionProvider');
  }
  return context;
}

export function useSelectionDispatch() {
  const context = useContext(SelectionDispatchContext);
  if (context === undefined) {
    throw new Error('useSelectionDispatch must be used within a SelectionProvider');
  }
  return context;
}
