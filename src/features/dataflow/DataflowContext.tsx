import React, {createContext, useContext, useReducer, ReactNode, useCallback, useMemo} from 'react';
import {Runtime} from 'vega-typings/types/index.js';
import {GetReferenceClientRect} from 'tippy.js';
import ELK, {ElkNode} from 'elkjs';

// Define SerializedError type locally since we're no longer using Redux
type SerializedError = {
  message?: string;
  stack?: string;
  name?: string;
  code?: string;
};
import {SanitizedValue, sanitizeValue} from './utils/sanitizeValue.js';
import {toCytoscape} from './utils/toCytoscape.js';
import {runtimeToGraph} from './utils/runtimeToGraph.js';
import {allRelated} from './utils/allRelated.js';
import {associatedWith, filterEdges, intersectIDs, GraphType, types} from './utils/graph.js';
import {mapValues} from './utils/mapValues.js';
import {ELKToPositions} from './utils/ELKToPositions.js';
import {toELKGraph} from './utils/toELKGraph.js';
import {Worker as ElkWorker} from 'elkjs/lib/elk-worker.js';

// Types
export type Values = Record<string, SanitizedValue>;
export type Pulse = {clock: number; values: Values; nValues: number};
export type Elements = {nodes: string[]; edges: string[]};

export type SelectionState = {
  pulse: number | null;
  elements: Elements | null;
  types: {[Type in GraphType]: boolean};
};

export type PopupState = null | {
  type: 'node' | 'edge';
  id: string;
  referenceClientRect: ReturnType<GetReferenceClientRect>;
};

type LayoutKey = {
  graph: any | null;
  visibleNodesString: string | null;
};

type Positions = Record<string, {x: number; y: number}>;
type LayoutValue = {type: 'done'; positions: Positions} | {type: 'loading'} | {type: 'error'; error: SerializedError};
type LayoutStatus = {
  key: LayoutKey;
  value: LayoutValue;
};

// State interface
export interface DataflowState {
  runtime: Runtime | null;
  pulses: Pulse[];
  selection: SelectionState;
  popup: PopupState;
  layout: Record<string, LayoutStatus>;
}

// Actions
type DataflowAction =
  | {type: 'SET_RUNTIME'; payload: Runtime}
  | {type: 'RECORD_PULSE'; payload: {clock: number; values: Record<string, unknown>}}
  | {type: 'RESET_PULSES'}
  | {type: 'SET_SELECTED_PULSE'; payload: number | null}
  | {type: 'SET_SELECTED_ELEMENTS'; payload: Elements | null}
  | {type: 'SET_SELECTED_TYPE'; payload: {type: GraphType; enabled: boolean}}
  | {type: 'SET_POPUP'; payload: PopupState}
  | {type: 'SET_LAYOUT_LOADING'; payload: {requestId: string; key: LayoutKey}}
  | {type: 'SET_LAYOUT_DONE'; payload: {requestId: string; positions: Positions}}
  | {type: 'SET_LAYOUT_ERROR'; payload: {requestId: string; error: SerializedError}};

// Initial state
const MAX_PULSES = 100;

const initialState: DataflowState = {
  runtime: null,
  pulses: [],
  selection: {
    pulse: null,
    elements: null,
    types: mapValues(types, (props) => props.default),
  },
  popup: null,
  layout: {},
};

// Reducer
function dataflowReducer(state: DataflowState, action: DataflowAction): DataflowState {
  switch (action.type) {
    case 'SET_RUNTIME':
      return {
        ...state,
        runtime: action.payload,
        pulses: [],
        selection: {
          ...state.selection,
          pulse: null,
        },
        layout: {},
      };

    case 'RECORD_PULSE': {
      const {clock, values} = action.payload;
      const sanitizedValues = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, sanitizeValue(v)]));
      const newPulse = {clock, values: sanitizedValues, nValues: Object.keys(sanitizedValues).length};

      let newPulses = [...state.pulses, newPulse];
      if (newPulses.length > MAX_PULSES) {
        newPulses = newPulses.slice(1);
      }

      return {
        ...state,
        pulses: newPulses,
      };
    }

    case 'RESET_PULSES':
      return {
        ...state,
        pulses: [],
        selection: {
          ...state.selection,
          pulse: null,
        },
      };

    case 'SET_SELECTED_PULSE':
      return {
        ...state,
        selection: {
          ...state.selection,
          pulse: action.payload,
        },
      };

    case 'SET_SELECTED_ELEMENTS': {
      const elements =
        action.payload === null
          ? null
          : {
              nodes: action.payload.nodes.slice().sort(),
              edges: action.payload.edges.slice().sort(),
            };
      return {
        ...state,
        selection: {
          ...state.selection,
          elements,
        },
      };
    }

    case 'SET_SELECTED_TYPE':
      return {
        ...state,
        selection: {
          ...state.selection,
          types: {
            ...state.selection.types,
            [action.payload.type]: action.payload.enabled,
          },
        },
      };

    case 'SET_POPUP':
      return {
        ...state,
        popup: action.payload,
      };

    case 'SET_LAYOUT_LOADING':
      return {
        ...state,
        layout: {
          ...state.layout,
          [action.payload.requestId]: {
            value: {type: 'loading'},
            key: action.payload.key,
          },
        },
      };

    case 'SET_LAYOUT_DONE':
      return {
        ...state,
        layout: {
          ...state.layout,
          [action.payload.requestId]: {
            ...state.layout[action.payload.requestId],
            value: {type: 'done', positions: action.payload.positions},
          },
        },
      };

    case 'SET_LAYOUT_ERROR':
      return {
        ...state,
        layout: {
          ...state.layout,
          [action.payload.requestId]: {
            ...state.layout[action.payload.requestId],
            value: {type: 'error', error: action.payload.error},
          },
        },
      };

    default:
      return state;
  }
}

// Context
interface DataflowComputed {
  graph: any | null;
  cytoscapeElements: any | null;
  sortedPulses: Pulse[];
  pulsesEmpty: boolean;
  selectedPulse: number | null;
  selectedElements: Elements | null;
  selectedTypes: {[Type in GraphType]: boolean};
  elementsSelected: boolean;
  selectedValues: Values | null;
  visibleNodesFromPulse: Set<string> | null;
  visibleNodesFromElements: Set<string> | null;
  visibleNodesFromTypes: Set<string> | null;
  visibleNodes: Set<string> | null;
  filteredEdges: any | null;
  visibleElements: {nodes: Set<string>; edges: Set<string>} | null;
  currentLayout: LayoutValue | null;
  currentPositions: Positions | null;
  popupValue: any | null;
}

interface DataflowActions {
  setRuntime: (runtime: Runtime) => void;
  recordPulse: (clock: number, values: Record<string, unknown>) => void;
  resetPulses: () => void;
  setSelectedPulse: (pulse: number | null) => void;
  setSelectedElements: (elements: Elements | null) => void;
  setSelectedType: (type: GraphType, enabled: boolean) => void;
  setPopup: (popup: PopupState) => void;
  computeLayout: () => Promise<void>;
}

interface DataflowContextType extends DataflowComputed, DataflowActions {
  state: DataflowState;
  dispatch: React.Dispatch<DataflowAction>;
}

const DataflowStateContext = createContext<{state: DataflowState; dispatch: React.Dispatch<DataflowAction>} | null>(
  null,
);
const DataflowComputedContext = createContext<DataflowComputed | null>(null);
const DataflowActionsContext = createContext<DataflowActions | null>(null);

// Provider component
interface DataflowProviderProps {
  children: ReactNode;
}

export function DataflowProvider({children}: DataflowProviderProps) {
  const [state, dispatch] = useReducer(dataflowReducer, initialState);

  // Initialize ELK
  const elk = useMemo(
    () =>
      new ELK({
        // @ts-expect-error Worker types broken
        workerFactory: (url) => new ElkWorker(url),
      }),
    [],
  );

  // Computed selectors
  const graph = useMemo(() => (state.runtime === null ? null : runtimeToGraph(state.runtime)), [state.runtime]);

  const cytoscapeElements = useMemo(() => (graph === null ? null : toCytoscape(graph)), [graph]);

  const sortedPulses = useMemo(() => state.pulses.slice(0).reverse(), [state.pulses]);

  const pulsesEmpty = useMemo(() => state.pulses.length === 0, [state.pulses]);

  const selectedPulse = state.selection.pulse;
  const selectedElements = state.selection.elements;
  const selectedTypes = state.selection.types;

  const elementsSelected = selectedElements !== null;

  const selectedValues = useMemo(
    () => (selectedPulse === null ? null : (state.pulses.find((p) => p.clock === selectedPulse)?.values ?? null)),
    [selectedPulse, state.pulses],
  );

  const visibleNodesFromPulse = useMemo(
    () => (selectedValues === null || graph === null ? null : associatedWith(graph, Object.keys(selectedValues))),
    [selectedValues, graph],
  );

  const visibleNodesFromElements = useMemo(
    () => (selectedElements === null || graph === null ? null : allRelated(graph, selectedElements)),
    [selectedElements, graph],
  );

  const visibleNodesFromTypes = useMemo(
    () =>
      graph === null
        ? null
        : new Set(
            Object.entries(graph.nodes)
              .filter(([, {type}]) => selectedTypes[type])
              .map(([id]) => id),
          ),
    [graph, selectedTypes],
  );

  const visibleNodes = useMemo(
    () => intersectIDs(visibleNodesFromPulse, visibleNodesFromElements, visibleNodesFromTypes),
    [visibleNodesFromPulse, visibleNodesFromElements, visibleNodesFromTypes],
  );

  const filteredEdges = useMemo(
    () => (visibleNodes === null || graph === null ? null : filterEdges(graph, visibleNodes)),
    [visibleNodes, graph],
  );

  const visibleElements = useMemo(
    () => (visibleNodes === null ? null : {nodes: visibleNodes, edges: filteredEdges ?? new Set()}),
    [visibleNodes, filteredEdges],
  );

  // Layout computation
  const currentLayoutKey = useMemo(() => {
    const visibleNodesString = visibleNodes === null ? null : [...visibleNodes].sort().join(',');
    return {graph, visibleNodesString};
  }, [graph, visibleNodes]);

  const currentLayoutStatus = useMemo(
    () =>
      Object.values(state.layout).find((layoutStatus) => {
        const key = layoutStatus?.key;
        return key && graph === key.graph && currentLayoutKey.visibleNodesString === key.visibleNodesString;
      }) ?? null,
    [state.layout, currentLayoutKey, graph],
  );

  const currentLayout = currentLayoutStatus?.value ?? null;
  const currentPositions = currentLayout?.type === 'done' ? currentLayout.positions : null;

  const popupValue = useMemo(() => {
    if (state.popup === null || graph === null) return null;

    return state.popup.type === 'node'
      ? {
          node: graph.nodes[state.popup.id],
          value: selectedValues === null ? null : (selectedValues[state.popup.id] ?? null),
          ...state.popup,
          type: 'node' as const,
        }
      : {
          edge: graph.edges[state.popup.id],
          ...state.popup,
          type: 'edge' as const,
        };
  }, [state.popup, graph, selectedValues]);

  // Actions
  const setRuntime = useCallback((runtime: Runtime) => {
    dispatch({type: 'SET_RUNTIME', payload: runtime});
  }, []);

  const recordPulse = useCallback((clock: number, values: Record<string, unknown>) => {
    dispatch({type: 'RECORD_PULSE', payload: {clock, values}});
  }, []);

  const resetPulses = useCallback(() => {
    dispatch({type: 'RESET_PULSES'});
  }, []);

  const setSelectedPulse = useCallback((pulse: number | null) => {
    dispatch({type: 'SET_SELECTED_PULSE', payload: pulse});
  }, []);

  const setSelectedElements = useCallback((elements: Elements | null) => {
    dispatch({type: 'SET_SELECTED_ELEMENTS', payload: elements});
  }, []);

  const setSelectedType = useCallback((type: GraphType, enabled: boolean) => {
    dispatch({type: 'SET_SELECTED_TYPE', payload: {type, enabled}});
  }, []);

  const setPopup = useCallback((popup: PopupState) => {
    dispatch({type: 'SET_POPUP', payload: popup});
  }, []);

  const computeLayout = useCallback(async () => {
    if (!visibleElements || !graph) return;

    const elkGraph = toELKGraph(graph, visibleElements);
    const requestId = Math.random().toString(36).substr(2, 9);

    dispatch({type: 'SET_LAYOUT_LOADING', payload: {requestId, key: currentLayoutKey}});

    try {
      const result = await elk.layout(elkGraph);
      dispatch({type: 'SET_LAYOUT_DONE', payload: {requestId, positions: ELKToPositions(result)}});
    } catch (error) {
      dispatch({
        type: 'SET_LAYOUT_ERROR',
        payload: {
          requestId,
          error: {message: error.message, stack: error.stack} as SerializedError,
        },
      });
    }
  }, [visibleElements, graph, currentLayoutKey, elk]);

  const stateContextValue = useMemo(() => ({state, dispatch}), [state]);

  const computedContextValue = useMemo<DataflowComputed>(
    () => ({
      graph,
      cytoscapeElements,
      sortedPulses,
      pulsesEmpty,
      selectedPulse,
      selectedElements,
      selectedTypes,
      elementsSelected,
      selectedValues,
      visibleNodesFromPulse,
      visibleNodesFromElements,
      visibleNodesFromTypes,
      visibleNodes,
      filteredEdges,
      visibleElements,
      currentLayout,
      currentPositions,
      popupValue,
    }),
    [
      graph,
      cytoscapeElements,
      sortedPulses,
      pulsesEmpty,
      selectedPulse,
      selectedElements,
      selectedTypes,
      elementsSelected,
      selectedValues,
      visibleNodesFromPulse,
      visibleNodesFromElements,
      visibleNodesFromTypes,
      visibleNodes,
      filteredEdges,
      visibleElements,
      currentLayout,
      currentPositions,
      popupValue,
    ],
  );

  const actionsContextValue = useMemo<DataflowActions>(
    () => ({
      setRuntime,
      recordPulse,
      resetPulses,
      setSelectedPulse,
      setSelectedElements,
      setSelectedType,
      setPopup,
      computeLayout,
    }),
    [
      setRuntime,
      recordPulse,
      resetPulses,
      setSelectedPulse,
      setSelectedElements,
      setSelectedType,
      setPopup,
      computeLayout,
    ],
  );

  return (
    <DataflowStateContext.Provider value={stateContextValue}>
      <DataflowComputedContext.Provider value={computedContextValue}>
        <DataflowActionsContext.Provider value={actionsContextValue}>{children}</DataflowActionsContext.Provider>
      </DataflowComputedContext.Provider>
    </DataflowStateContext.Provider>
  );
}

// Hook to use the dataflow context
export function useDataflowState() {
  const context = useContext(DataflowStateContext);
  if (!context) {
    throw new Error('useDataflowState must be used within a DataflowProvider');
  }
  return context;
}

export function useDataflowComputed() {
  const context = useContext(DataflowComputedContext);
  if (!context) {
    throw new Error('useDataflowComputed must be used within a DataflowProvider');
  }
  return context;
}

export function useDataflowActions() {
  const context = useContext(DataflowActionsContext);
  if (!context) {
    throw new Error('useDataflowActions must be used within a DataflowProvider');
  }
  return context;
}

export function useDataflow(): DataflowContextType {
  const {state, dispatch} = useDataflowState();
  const computed = useDataflowComputed();
  const actions = useDataflowActions();
  return useMemo(
    () => ({
      state,
      dispatch,
      ...computed,
      ...actions,
    }),
    [state, dispatch, computed, actions],
  );
}
