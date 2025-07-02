# Class to Function Component Migration Plan for Vega Editor

This document outlines a comprehensive plan for migrating class components to functional components with hooks in the Vega Editor project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Benefits of Migration](#benefits-of-migration)
3. [Component Inventory](#component-inventory)
4. [Migration Priority](#migration-priority)
5. [Migration Strategy](#migration-strategy)
6. [Conversion Patterns](#conversion-patterns)
7. [Testing Strategy](#testing-strategy)
8. [Timeline](#timeline)
9. [Risks and Mitigations](#risks-and-mitigations)
10. [Component-Specific Migration Guide](#component-specific-migration-guide)

## Project Overview

The Vega Editor is primarily built with class components using React Redux. The project consists of various components organized in directories such as:

- `viz-pane/`
- `renderer/`
- `input-panel/`
- `header/`
- `config-editor/`
- `data-viewer/`
- `signal-viewer/`
- And others

Most components follow the container/presenter pattern with Redux connect.

## Benefits of Migration

1. **Simpler Code:** Functional components are more concise and easier to understand
2. **Better Component Logic Reuse:** Hooks make it easier to extract and reuse logic
3. **Improved Performance:** Hooks allow for more granular rendering optimizations
4. **Maintainability:** Easier to maintain as React continues to optimize for Hooks
5. **Reduced Boilerplate:** No need for binding methods or complex lifecycle management
6. **Modern Patterns:** Align with current React best practices and community direction

## Component Inventory

### Core Components

1. **App** (`app.tsx`)
   - Central component that manages routing and application layout
   - Uses lifecycle methods for setup and URL handling

2. **VizPane** (`viz-pane/renderer.tsx`)
   - Handles visualization display and debug pane
   - Uses lifecycle methods and state management

3. **Renderer** (`renderer/renderer.tsx`)
   - Core visualization rendering logic
   - Complex lifecycle methods and state management

4. **InputPanel** (`input-panel/index.tsx`)
   - Manages the editing interface
   - Coordinates between spec editors

### UI Components

5. **Header** (`header/renderer.tsx`)
   - Navigation and control UI
   - Manages modals and navigation

6. **ErrorBoundary** (`error-boundary/renderer.tsx`)
   - Error handling wrapper
   - Uses componentDidCatch lifecycle

7. **Table** (`table/renderer.tsx`)
   - Data visualization in tabular format
   - Simple rendering logic

### Modal Components

8. **ExportModal** (`header/export-modal/renderer.tsx`)
   - Export functionality UI
   - State management for export options

9. **ShareModal** (`header/share-modal/renderer.tsx`)
   - Sharing functionality UI
   - Complex state management

10. **GistModal** (`header/gist-modal/renderer.tsx`)
    - GitHub Gist integration
    - API integration and state management

### Editor Components

11. **SpecEditor** (`input-panel/spec-editor/renderer.tsx`)
    - Monaco editor integration
    - Complex event handling

12. **ConfigEditor** (`config-editor/renderer.tsx`)
    - Configuration editing interface
    - Monaco editor integration

### Viewer Components

13. **DataViewer** (`data-viewer/renderer.tsx`)
    - Data visualization and inspection
    - Table-based visualization

14. **SignalViewer** (`signal-viewer/renderer.tsx`)
    - Vega signal monitoring
    - Dynamic updates and state management

## Migration Priority

We'll prioritize components based on complexity, impact, and dependencies:

### Phase 1: Simple, Self-Contained Components

- ErrorBoundary(✅)
- Table (✅)                     
- LoginConditional (⚠️)
- DebugPaneHeader
- ConfigEditorHeader
- TimelineRow (✅)
- SignalRow (✅)

### Phase 2: UI Components

- ErrorPane(✅)
- SpecEditorHeader(✅)
- CompiledSpecHeader(✅)
- CompiledSpecDisplay(✅)
- GistSelectWidget

### Phase 3: Modal Components

- ExportModal (✅)
- ShareModal (✅)
- GistModal 

### Phase 4: Viewer Components

- DataViewer
- SignalViewer
- DataflowViewer

### Phase 5: Editor Components

- SpecEditor
- ConfigEditor
- InputPanel

### Phase 6: Core Components

- VizPane
- Renderer
- Header
- App

## Migration Strategy

### General Approach

1. **One Component at a Time:** Migrate components incrementally, starting with simpler ones
2. **Test Thoroughly:** Test each component after migration
3. **Keep Redux Patterns:** Maintain existing Redux connection patterns initially
4. **Extract Hooks Gradually:** Create custom hooks for common patterns after migration
5. **Update Documentation:** Document new patterns and approaches

### Rules for Migration

1. Maintain the same component API (props interface)
2. Preserve all existing functionality
3. Keep Redux connections consistent
4. Document any behavior changes
5. Focus on clean, readable code

## Conversion Patterns

### Basic Class to Function Conversion

```jsx
// Before
class MyComponent extends React.PureComponent<Props, State> {
  render() {
    return <div>{this.props.content}</div>;
  }
}

// After
const MyComponent: React.FC<Props> = (props) => {
  return <div>{props.content}</div>;
};
```

### State Management

```jsx
// Before
class MyComponent extends React.PureComponent<Props, State> {
  state = { count: 0 };
  
  increment = () => {
    this.setState(prev => ({ count: prev.count + 1 }));
  };
  
  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}

// After
const MyComponent: React.FC<Props> = (props) => {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};
```

### Lifecycle Methods

```jsx
// Before
componentDidMount() {
  document.addEventListener('keydown', this.handleKeydown);
  this.initView();
}

componentDidUpdate(prevProps) {
  if (prevProps.spec !== this.props.spec) {
    this.initView();
  }
}

componentWillUnmount() {
  document.removeEventListener('keydown', this.handleKeydown);
}

// After
useEffect(() => {
  document.addEventListener('keydown', handleKeydown);
  initView();
  
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
}, []);

useEffect(() => {
  initView();
}, [spec]);
```

### Refs

```jsx
// Before
class MyComponent extends React.Component {
  private chartRef = React.createRef<HTMLDivElement>();
  
  focusChart() {
    this.chartRef.current?.focus();
  }
  
  render() {
    return <div ref={this.chartRef} />;
  }
}

// After
const MyComponent = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  const focusChart = () => {
    chartRef.current?.focus();
  };
  
  return <div ref={chartRef} />;
};
```

### Connected Components

```jsx
// Before
class MyConnectedComponent extends React.Component<Props> {
  // ...
}

export default connect(mapStateToProps, mapDispatchToProps)(MyConnectedComponent);

// After
const MyConnectedComponent: React.FC<Props> = (props) => {
  // ...
};

export default connect(mapStateToProps, mapDispatchToProps)(MyConnectedComponent);

// Or using hooks
const MyConnectedComponent: React.FC<Omit<Props, /* redux props */>> = (props) => {
  const dispatch = useDispatch();
  const reduxState = useAppSelector(state => ({
    // select state properties
  }));
  
  // ...
};
```

## Testing Strategy

1. **Unit Tests:** Update and add unit tests for each migrated component
2. **Integration Tests:** Ensure components work together as expected
3. **Visual Regression:** Verify UI appearance remains consistent
4. **Manual Testing:** Perform manual testing of critical functionality
5. **Performance Benchmarks:** Compare performance before and after migration

## Timeline

- **Phase 1:** 1-2 weeks
- **Phase 2:** 2-3 weeks
- **Phase 3:** 2-3 weeks
- **Phase 4:** 3-4 weeks
- **Phase 5:** 3-4 weeks
- **Phase 6:** 4-6 weeks

**Total Estimated Time:** 15-22 weeks (3-5.5 months)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes in behavior | High | Thorough testing, careful migration, clear documentation |
| Performance regressions | Medium | Performance monitoring, memoization |
| Developer learning curve | Medium | Documentation, pair programming, code reviews |
| Complex lifecycle methods | High | Careful analysis, possibly breaking into custom hooks |
| Redux integration complexity | Medium | Maintain existing patterns initially, gradually adopt hooks API |
| Refs handling | Medium | Thorough testing of components with refs |
| Error boundaries | Medium | Special care for error boundary components |

## Component-Specific Migration Guide

### ErrorBoundary

```jsx
// Before
export default class ErrorBoundary extends React.PureComponent<Props> {
  public componentDidCatch(error: Error) {
    this.props.logError(error);
  }

  public render() {
    if (this.props.error) {
      return (
        <div id="error-indicator" onClick={this.props.toggleDebugPane}>
          {this.props.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// After
const ErrorBoundary: React.FC<Props> = (props) => {
  const errorBoundaryRef = useRef<{hasError: boolean}>({hasError: false});
  
  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      props.logError(error.error);
      errorBoundaryRef.current.hasError = true;
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [props.logError]);
  
  if (props.error) {
    return (
      <div id="error-indicator" onClick={props.toggleDebugPane}>
        {props.error.message}
      </div>
    );
  }
  
  return <>{props.children}</>;
};

// Note: React 16+ error boundaries must be class components
// For a complete migration, we would keep the class for error boundaries
// and focus on functional patterns for the internal implementation
```

### Renderer (Complex Example)

```jsx
// Before (partial)
class Editor extends React.PureComponent<Props, State> {
  private chartRef = React.createRef<HTMLDivElement>();
  
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.handleKeydown = this.handleKeydown.bind(this);
    this.runAfter = this.runAfter.bind(this);
  }
  
  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    this.initView();
    this.renderVega();
  }
  
  public componentDidUpdate(prevProps) {
    if (
      !deepEqual(prevProps.vegaSpec, this.props.vegaSpec) ||
      !deepEqual(prevProps.config, this.props.config) ||
      // other conditions
    ) {
      this.initView();
      this.renderVega();
    }
  }
  
  public componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    if (this.props.view) {
      this.props.view.finalize();
    }
  }
  
  // Other methods...
}

// After (partial)
const Editor: React.FC<Props> = (props) => {
  const {
    vegaSpec, config, mode, view, 
    setView, setRuntime, hoverEnable, expressionInterpreter
  } = props;
  
  const [state, setState] = useState<State>(defaultState);
  const chartRef = useRef<HTMLDivElement>(null);
  const fullscreenChartRef = useRef<HTMLDivElement>(null);
  
  // Extract key methods to custom hooks or local functions
  const initView = useCallback(() => {
    // Implementation
  }, [vegaSpec, config, mode, setView, setRuntime, hoverEnable, expressionInterpreter]);
  
  const renderVega = useCallback(async () => {
    // Implementation
  }, [view, state.fullscreen, chartRef, fullscreenChartRef]);
  
  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.keyCode === KEYCODES.ESCAPE && state.fullscreen) {
      setState({...state, fullscreen: false});
      onClosePortal();
    }
  }, [state.fullscreen]);
  
  // Effects to replace lifecycle methods
  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    initView();
    renderVega();
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      if (view) {
        view.finalize();
      }
    };
  }, []);
  
  useEffect(() => {
    if (
      !deepEqual(props.vegaSpec, vegaSpec) ||
      !deepEqual(props.config, config) ||
      // other conditions
    ) {
      initView();
      renderVega();
    }
  }, [vegaSpec, config, mode, renderer, tooltipEnable, hoverEnable, expressionInterpreter]);
  
  // Render method stays similar
  return (
    // JSX
  );
};
```

This migration plan provides a structured approach to converting class components to functional components with hooks in a large React application. By following this plan, the team can gradually modernize the codebase while maintaining functionality and stability.