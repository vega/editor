import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {editorSlice} from '../slices/editorSlice.js';
import {uiSlice} from '../slices/uiSlice.js';
import {authSlice} from '../slices/authSlice.js';
import {configSlice} from '../slices/configSlice.js';
// dataflowInitialState is used by the persistenceMiddleware to exclude certain fields
import {dataflowReducer, dataflowInitialState} from '../features/dataflow/index.js';
import {persistenceMiddleware} from './middleware/persistence.js';

const regularReducers = combineReducers({
  editor: editorSlice.reducer,
  ui: uiSlice.reducer,
  auth: authSlice.reducer,
  config: configSlice.reducer,
});

const rootReducer = (state: any, action: any) => {
  const regularState = regularReducers(state, action);

  return dataflowReducer(regularState, action);
};

const loadPersistedState = (): any => {
  try {
    const serializedState = localStorage.getItem('vega-editor-state');
    if (serializedState === null) {
      return undefined;
    }

    const state = JSON.parse(serializedState);

    const excludedFields = [
      'editor.editorRef',
      'editor.compiledEditorRef',
      'editor.signals',
      'editor.view',
      ...Object.keys(dataflowInitialState).map((key) => `dataflow.${key}`),
    ];

    return state;
  } catch (err) {
    console.warn('Error loading state from localStorage:', err);
    return undefined;
  }
};

export const store = configureStore({
  reducer: rootReducer,
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
