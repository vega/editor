import {configureStore, Middleware} from '@reduxjs/toolkit';
import rootReducer from '../reducers/index.js';
import {dataflowInitialState} from '../features/dataflow/index.js';
import {DEFAULT_STATE, State} from '../constants/default-state.js';

const loadPersistedState = (): Partial<State> | undefined => {
  try {
    const serializedState = localStorage.getItem('vega-editor-state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.warn('Error loading state from localStorage:', err);
    return undefined;
  }
};

const persistenceMiddleware: Middleware<object, State> = (store) => (next) => (action) => {
  const result = next(action);

  const state = store.getState();

  const excludedFields = [
    'editorRef',
    'compiledEditorRef',
    'view',
    'signals',
    'isAuthenticated',
    'errors',
    'error',
    'warns',
    'infos',
    'debugs',
    ...Object.keys(dataflowInitialState),
  ];

  const persistableState = Object.fromEntries(Object.entries(state).filter(([key]) => !excludedFields.includes(key)));

  try {
    localStorage.setItem('vega-editor-state', JSON.stringify(persistableState));
  } catch (err) {
    console.warn('Error saving state to localStorage:', err);
  }

  return result;
};

export default function configureStoreModern(initialState: State = DEFAULT_STATE) {
  const persistedState = loadPersistedState();
  const preloadedState = persistedState ? {...initialState, ...persistedState} : initialState;

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'SET_EDITOR_REFERENCE',
            'SET_COMPILED_EDITOR_REFERENCE',
            'SET_VIEW',
            'SET_SIGNALS',
          ],
          ignoredPaths: ['editorRef', 'compiledEditorRef', 'view', 'signals'],
        },
        immutableCheck: {
          warnAfter: 128,
        },
      }).concat(persistenceMiddleware),

    devTools: process.env.NODE_ENV !== 'production' && {
      name: 'Vega Editor',
      trace: true,
      traceLimit: 25,
      actionSanitizer: (action: any) => {
        if (action.type === 'UPDATE_VEGA_SPEC' || action.type === 'UPDATE_VEGA_LITE_SPEC') {
          return {
            ...action,
            spec: action.spec ? `${action.spec.substring(0, 100)}...` : action.spec,
          };
        }
        return action;
      },
      stateSanitizer: (state: any) => {
        return {
          ...state,
          vegaSpec: state.vegaSpec ? '[VegaSpec Object]' : state.vegaSpec,
          vegaLiteSpec: state.vegaLiteSpec ? '[VegaLiteSpec Object]' : state.vegaLiteSpec,
          normalizedVegaLiteSpec: state.normalizedVegaLiteSpec
            ? '[NormalizedSpec Object]'
            : state.normalizedVegaLiteSpec,
        };
      },
    },
  });
}

export type ModernStore = ReturnType<typeof configureStoreModern>;
export type ModernRootState = ReturnType<ModernStore['getState']>;
export type ModernAppDispatch = ModernStore['dispatch'];
