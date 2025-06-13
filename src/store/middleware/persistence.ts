import {Middleware} from '@reduxjs/toolkit';

const EXCLUDED_FIELDS = [
  'editor.editorRef',
  'editor.compiledEditorRef',
  'editor.signals',
  'editor.view',
  'auth.isAuthenticated',
  'editor.errors',
  'editor.error',
  'editor.warns',
  'editor.infos',
  'editor.debugs',
  'editor.view',
];

const shouldExcludeField = (path: string): boolean => {
  return EXCLUDED_FIELDS.some((excluded) => path.startsWith(excluded));
};

const createPersistableState = (state: any): any => {
  const filterState = (obj: any, currentPath: string = ''): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) => filterState(item, `${currentPath}[${index}]`));
    }

    const filtered: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;

      if (!shouldExcludeField(fieldPath)) {
        filtered[key] = filterState(value, fieldPath);
      }
    }

    return filtered;
  };

  return filterState(state);
};

const loadStateFromStorage = (): any => {
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

const saveStateToStorage = (state: any): void => {
  try {
    const persistableState = createPersistableState(state);
    const serializedState = JSON.stringify(persistableState);
    localStorage.setItem('vega-editor-state', serializedState);
  } catch (err) {
    console.warn('Error saving state to localStorage:', err);
  }
};

export const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  const state = store.getState();
  saveStateToStorage(state);

  return result;
};

export const loadPersistedState = (): any => {
  return loadStateFromStorage();
};
