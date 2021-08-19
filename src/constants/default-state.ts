import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {Renderers, Spec} from 'vega';
import {Config, vega} from 'vega-embed';
import {TopLevelSpec as VlSpec} from 'vega-lite';
import {dataflowInitialState} from '../features/dataflow';

import {
  COMPILEDPANE,
  EDITOR_FOCUS,
  GistPrivacy,
  LAYOUT,
  Mode,
  NAVBAR,
  SIDEPANE,
  VEGA_LITE_START_SPEC,
  View,
} from './consts';

export type State = {
  isAuthenticated: boolean;
  baseURL: string;
  compiledVegaSpec: boolean;
  compiledVegaPaneSize: number;
  config: Config;
  configEditorString: string;
  debugPane: boolean;
  debugPaneSize: number;
  decorations: any;
  editorRef: Monaco.editor.IStandaloneCodeEditor;
  compiledEditorRef: Monaco.editor.IStandaloneCodeEditor;
  editorFocus: string;
  editorString: string;
  error: {message: string}; // don't put Error here since we can't serialize it
  export: boolean;
  gist: string;
  handle: string;
  hoverEnable: boolean | 'auto';
  logLevel: number;
  lastPosition: number;
  logs: boolean;
  manualParse: boolean;
  mode: Mode;
  name: string;
  navItem: string;
  sidePaneItem: string;
  compiledPaneItem: string;
  parse: boolean;
  private: GistPrivacy;
  profilePicUrl: string;
  renderer: Renderers;
  selectedExample: string;
  settings: boolean;
  signals: any;
  tooltipEnable: boolean;
  vegaLiteSpec: VlSpec;
  normalizedVegaLiteSpec: any;
  vegaSpec: Spec;
  view: View;
  errors: string[];
  warns: string[];
  infos: string[];
  debugs: string[];
  themeName: string;
  backgroundColor: string;
} & typeof dataflowInitialState;

export const DEFAULT_STATE: State = {
  baseURL: null,
  compiledEditorRef: null,
  compiledVegaPaneSize: LAYOUT.MinPaneSize,
  compiledVegaSpec: false,
  config: {},
  configEditorString: '{}',
  debugPane: false,
  debugPaneSize: LAYOUT.MinPaneSize,
  decorations: [],
  editorFocus: EDITOR_FOCUS.SpecEditor,
  editorRef: null,
  editorString: VEGA_LITE_START_SPEC,
  error: null,
  export: false,
  gist: null,
  handle: '',
  hoverEnable: 'auto',
  isAuthenticated: false,
  lastPosition: 0,
  logLevel: vega.Warn,
  logs: false,
  manualParse: false,
  mode: Mode.VegaLite,
  name: '',
  navItem: NAVBAR.Logs,
  parse: false,
  private: GistPrivacy.ALL,
  profilePicUrl: '',
  renderer: 'svg',
  selectedExample: null,
  settings: false,
  sidePaneItem: SIDEPANE.Editor,
  compiledPaneItem: COMPILEDPANE.Vega,
  signals: {},
  themeName: 'custom',
  tooltipEnable: true,
  vegaLiteSpec: null,
  normalizedVegaLiteSpec: null,
  vegaSpec: {},
  view: null,
  errors: [],
  warns: [],
  debugs: [],
  infos: [],
  backgroundColor: '#ffffff',
  ...dataflowInitialState,
};
