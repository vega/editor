import {
  createContext,
  FC,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  PropsWithChildren,
  useRef,
  useEffect,
} from 'react';
import {editor} from 'monaco-editor';
import React from 'react';

import {State, DEFAULT_STATE} from '../constants/default-state';
import {dispatchingLogger} from '../utils/logger';

export type AppContextType = {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
};

const AppContext = createContext<AppContextType | null>(null);

const LOCAL_STORAGE_KEY = 'state';

// Only including serializable fields
function filterPersistedState(state: State): Partial<State> {
  const {
    editorRef,
    compiledEditorRef,
    view,
    error,
    errors,
    warns,
    infos,
    debugs,
    runtime,
    signals,
    decorations,
    ...persisted
  } = state;
  return persisted;
}

export const AppContextProvider: FC<PropsWithChildren<{}>> = ({children}) => {
  const [state, setState] = useState<State>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {...DEFAULT_STATE, ...parsed};
      }
    }
    return DEFAULT_STATE;
  });
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filterPersistedState(state)));
    }
  }, [state]);

  useEffect(() => {
    dispatchingLogger.initializeSetState(setState);
  }, []);

  useEffect(() => {
    dispatchingLogger.updateCurrentState(state);
  }, [state]);

  return <AppContext.Provider value={{state, setState, editorRef}}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
