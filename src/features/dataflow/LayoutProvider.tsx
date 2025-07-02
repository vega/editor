import * as React from 'react';
import ELK, {ElkNode} from 'elkjs';
import {createContext, useContext, useReducer, useEffect, useMemo} from 'react';

import {toELKGraph} from './utils/toELKGraph.js';
import {ELKToPositions} from './utils/ELKToPositions.js';
import {useAppContext} from '../../context/app-context.js';
import {runtimeToGraph} from './utils/runtimeToGraph.js';
import {intersectIDs, associatedWith, filterEdges} from './utils/graph.js';
import {allRelated} from './utils/allRelated.js';

// State and Reducer
type Positions = Record<string, {x: number; y: number}>;
type LayoutValue = {type: 'done'; positions: Positions} | {type: 'loading'} | {type: 'error'; error: any};

interface LayoutState {
  key: string;
  value: LayoutValue;
}

const initialState: LayoutState = {
  key: '',
  value: {type: 'loading'},
};

function layoutReducer(state: LayoutState, action: any): LayoutState {
  switch (action.type) {
    case 'COMPUTE_LAYOUT_PENDING':
      return {
        ...state,
        value: {type: 'loading'},
      };
    case 'COMPUTE_LAYOUT_FULFILLED':
      return {
        ...state,
        value: {type: 'done', positions: action.payload},
      };
    case 'COMPUTE_LAYOUT_REJECTED':
      return {
        ...state,
        value: {type: 'error', error: action.payload},
      };
    case 'SET_KEY':
      return {
        ...state,
        key: action.payload,
      };
    default:
      return state;
  }
}

// Context
const LayoutStateContext = createContext<LayoutState | undefined>(undefined);
const LayoutDispatchContext = createContext<React.Dispatch<any> | undefined>(undefined);

// Provider - use default ELK without worker factory for now
const elk = new ELK();

export function LayoutProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  const {state: appState} = useAppContext();
  const {runtime, types, pulse, elements} = appState;

  const graph = useMemo(() => (runtime ? runtimeToGraph(runtime) : null), [runtime]);

  const visibleNodes = useMemo(() => {
    if (graph === null) {
      return null;
    }
    const typeNodes = new Set(
      Object.values(graph.nodes)
        .filter((node) => types[node.type])
        .map((node) => (node as any).id),
    );

    const pulseNodes = pulse ? associatedWith(graph, [pulse.toString()]) : null;
    const elementNodes = elements ? allRelated(graph, elements) : null;

    return intersectIDs(typeNodes, pulseNodes, elementNodes);
  }, [graph, types, pulse, elements]);

  const visibleElements = useMemo(() => {
    if (graph === null || visibleNodes === null) {
      return null;
    }
    return {nodes: visibleNodes, edges: filterEdges(graph, visibleNodes)};
  }, [graph, visibleNodes]);

  const layoutKey = useMemo(() => {
    if (!graph || !visibleNodes) return '';
    return `${Object.keys(graph.nodes).join(',')}-${[...visibleNodes].sort().join(',')}`;
  }, [graph, visibleNodes]);

  useEffect(() => {
    if (layoutKey && layoutKey !== state.key) {
      dispatch({type: 'SET_KEY', payload: layoutKey});
      dispatch({type: 'COMPUTE_LAYOUT_PENDING'});
      const elkGraph = toELKGraph(graph, visibleElements);
      elk
        .layout(elkGraph)
        .then((layout) => {
          dispatch({type: 'COMPUTE_LAYOUT_FULFILLED', payload: ELKToPositions(layout)});
        })
        .catch((error) => {
          dispatch({type: 'COMPUTE_LAYOUT_REJECTED', payload: error});
        });
    }
  }, [layoutKey, state.key, graph, visibleElements]);

  return (
    <LayoutStateContext.Provider value={state}>
      <LayoutDispatchContext.Provider value={dispatch}>{children}</LayoutDispatchContext.Provider>
    </LayoutStateContext.Provider>
  );
}

// Hooks
export function useLayoutState() {
  const context = useContext(LayoutStateContext);
  if (context === undefined) {
    throw new Error('useLayoutState must be used within a LayoutProvider');
  }
  return context;
}

export function useCurrentPositions() {
  const state = useLayoutState();
  if (state.value.type === 'done') {
    return state.value.positions;
  }
  return null;
}
