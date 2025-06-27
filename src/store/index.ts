import {configureStore, combineReducers, Reducer} from '@reduxjs/toolkit';
import {editorSlice} from '../slices/editorSlice.js';
import {uiSlice} from '../slices/uiSlice.js';
import {authSlice} from '../slices/authSlice.js';
import {configSlice} from '../slices/configSlice.js';
import {dataflowReducer} from '../features/dataflow/index.js';
import {persistenceMiddleware} from './middleware/persistence.js';
import {State} from '../constants/default-state.js';

const regularReducers = combineReducers({
  editor: editorSlice.reducer,
  ui: uiSlice.reducer,
  auth: authSlice.reducer,
  config: configSlice.reducer,
});

const rootReducer: Reducer<State> = (state: any, action: any): State => {
  const regularState = regularReducers(state, action);

  return dataflowReducer(regularState as any, action);
};

const loadPersistedState = (): any => {
  try {
    const serializedState = localStorage.getItem('vega-editor-state');
    if (serializedState === null) {
      return undefined;
    }

    const state = JSON.parse(serializedState);

    return state;
  } catch (err) {
    console.warn('Error loading state from localStorage:', err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: rootReducer as any,
  preloadedState: loadPersistedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'editor/setEditorReference', 'editor/setCompiledEditorReference'],
        ignoredPaths: ['editor.editorRef', 'editor.compiledEditorRef', 'editor.view', 'editor.signals'],
      },
    }).concat(persistenceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
