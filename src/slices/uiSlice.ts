import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Renderers} from 'vega';
import {LAYOUT, NAVBAR, SIDEPANE, COMPILEDPANE} from '../constants/index.js';

interface UIState {
  compiledVegaSpec: boolean;
  compiledVegaPaneSize: number;
  debugPane: boolean;
  debugPaneSize: number;

  navItem: string;
  sidePaneItem: string;
  compiledPaneItem: string;

  settings: boolean;

  logs: boolean;
  logLevel: number;

  renderer: Renderers;
  hoverEnable: boolean | 'auto';
  tooltipEnable: boolean;

  themeName: string;
  backgroundColor: string;

  expressionInterpreter: boolean;
}

const initialState: UIState = {
  compiledVegaSpec: false,
  compiledVegaPaneSize: LAYOUT.MinPaneSize,
  debugPane: false,
  debugPaneSize: LAYOUT.MinPaneSize,
  navItem: NAVBAR.Logs,
  sidePaneItem: SIDEPANE.Editor,
  compiledPaneItem: COMPILEDPANE.Vega,
  settings: false,
  logs: false,
  logLevel: 3, // vega.Warn
  renderer: 'svg',
  hoverEnable: 'auto',
  tooltipEnable: true,
  themeName: 'custom',
  backgroundColor: '#ffffff',
  expressionInterpreter: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCompiledVegaSpec: (state) => {
      state.compiledVegaSpec = !state.compiledVegaSpec;
    },

    setCompiledVegaPaneSize: (state, action: PayloadAction<number>) => {
      state.compiledVegaPaneSize = action.payload;
    },

    toggleDebugPane: (state) => {
      state.debugPane = !state.debugPane;
    },

    setDebugPaneSize: (state, action: PayloadAction<number>) => {
      state.debugPaneSize = action.payload;
    },

    toggleNavbar: (state, action: PayloadAction<string>) => {
      state.navItem = action.payload;
    },

    setSidePaneItem: (state, action: PayloadAction<string>) => {
      state.sidePaneItem = action.payload;
    },

    setCompiledPaneItem: (state, action: PayloadAction<string>) => {
      state.compiledPaneItem = action.payload;
    },

    setSettingsState: (state, action: PayloadAction<boolean>) => {
      state.settings = action.payload;
    },

    showLogs: (state, action: PayloadAction<boolean>) => {
      state.logs = action.payload;
    },

    setLogLevel: (state, action: PayloadAction<number>) => {
      state.logLevel = action.payload;
    },

    setRenderer: (state, action: PayloadAction<Renderers>) => {
      state.renderer = action.payload;
    },

    setHover: (state, action: PayloadAction<boolean | 'auto'>) => {
      state.hoverEnable = action.payload;
    },

    setTooltip: (state, action: PayloadAction<boolean>) => {
      state.tooltipEnable = action.payload;
    },

    setThemeName: (state, action: PayloadAction<string>) => {
      state.themeName = action.payload;
    },

    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.backgroundColor = action.payload;
    },

    setExpressionInterpreter: (state, action: PayloadAction<boolean>) => {
      state.expressionInterpreter = action.payload;
    },
  },
});

export const {
  toggleCompiledVegaSpec,
  setCompiledVegaPaneSize,
  toggleDebugPane,
  setDebugPaneSize,
  toggleNavbar,
  setSidePaneItem,
  setCompiledPaneItem,
  setSettingsState,
  showLogs,
  setLogLevel,
  setRenderer,
  setHover,
  setTooltip,
  setThemeName,
  setBackgroundColor,
  setExpressionInterpreter,
} = uiSlice.actions;
