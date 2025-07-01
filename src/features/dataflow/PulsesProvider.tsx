import * as React from 'react';
import {createContext, FC, useCallback, useContext, useReducer} from 'react';

// import {Pulse} from './types'; // TODO: Create types file
import {SanitizedValue, sanitizeValue} from './utils/sanitizeValue';

// State and Reducer
export type Values = Record<string, SanitizedValue>;
export type Pulse = {clock: number; values: Values; nValues: number};
export type PulsesState = Pulse[];
const initialState: PulsesState = [];
const MAX_PULSES = 100;

function pulsesReducer(state: PulsesState, action: any): PulsesState {
  switch (action.type) {
    case 'RECORD_PULSE': {
      const newState = [...state];
      if (newState.length > MAX_PULSES) {
        newState.shift();
      }
      newState.push({...action.payload, nValues: Object.keys(action.payload.values).length});
      return newState;
    }
    case 'RESET_PULSES':
      return initialState;
    default:
      return state;
  }
}

// Context
const PulsesStateContext = createContext<PulsesState | undefined>(undefined);
const PulsesDispatchContext = createContext<React.Dispatch<any> | undefined>(undefined);

// Provider
export function PulsesProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(pulsesReducer, initialState);

  return (
    <PulsesStateContext.Provider value={state}>
      <PulsesDispatchContext.Provider value={dispatch}>{children}</PulsesDispatchContext.Provider>
    </PulsesStateContext.Provider>
  );
}

// Hooks
export function usePulsesState() {
  const context = useContext(PulsesStateContext);
  if (context === undefined) {
    throw new Error('usePulsesState must be used within a PulsesProvider');
  }
  return context;
}

export function usePulsesDispatch() {
  const context = useContext(PulsesDispatchContext);
  if (context === undefined) {
    throw new Error('usePulsesDispatch must be used within a PulsesProvider');
  }
  return context;
}

export function useRecordPulse() {
  const dispatch = usePulsesDispatch();
  return (clock: number, values: Record<string, unknown>) => {
    dispatch({
      type: 'RECORD_PULSE',
      payload: {
        clock,
        values: Object.fromEntries(Object.entries(values || {}).map(([k, v]) => [k, sanitizeValue(v)])),
      },
    });
  };
}
