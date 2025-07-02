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
} from 'react';
import {editor} from 'monaco-editor';
import React from 'react';

import {State, DEFAULT_STATE} from '../constants/default-state';

export type AppContextType = {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider: FC<PropsWithChildren<{}>> = ({children}) => {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  return <AppContext.Provider value={{state, setState, editorRef}}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
