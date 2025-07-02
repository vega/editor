import * as React from 'react';
import {createContext, useContext, useReducer} from 'react';
import {GetReferenceClientRect} from 'tippy.js';

// State and Reducer
export type PopupState = null | {
  type: 'node' | 'edge';
  id: string;
  referenceClientRect: ReturnType<GetReferenceClientRect>;
};

function popupReducer(state: PopupState, action: any): PopupState {
  switch (action.type) {
    case 'SET_POPUP':
      return action.payload;
    default:
      return state;
  }
}

// Context
const PopupStateContext = createContext<PopupState | undefined>(undefined);
const PopupDispatchContext = createContext<React.Dispatch<any> | undefined>(undefined);

// Provider
export function PopupProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(popupReducer, null);

  return (
    <PopupStateContext.Provider value={state}>
      <PopupDispatchContext.Provider value={dispatch}>{children}</PopupDispatchContext.Provider>
    </PopupStateContext.Provider>
  );
}

// Hooks
export function usePopupState() {
  const context = useContext(PopupStateContext);
  if (context === undefined) {
    throw new Error('usePopupState must be used within a PopupProvider');
  }
  return context;
}

export function usePopupDispatch() {
  const context = useContext(PopupDispatchContext);
  if (context === undefined) {
    throw new Error('usePopupDispatch must be used within a PopupProvider');
  }
  return context;
}
