import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {Renderers, Spec} from 'vega';
import {Config} from 'vega-embed';
import {TopLevelSpec as VlSpec} from 'vega-lite';
import {LocalLogger} from '../utils/logger';
import {EDITOR_FOCUS, LAYOUT, Mode, NAVBAR, SIDEPANE, VEGA_LITE_START_SPEC, View, GistPrivacy} from './consts';

export interface State {
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
  logLevel: string;
  lastPosition: number;
  logs: boolean;
  manualParse: boolean;
  mode: Mode;
  name: string;
  navItem: string;
  sidePaneItem: string;
  parse: boolean;
  private: GistPrivacy;
  profilePicUrl: string;
  renderer: Renderers;
  selectedExample: string;
  settings: boolean;
  signals: any;
  tooltipEnable: boolean;
  vegaLiteSpec: VlSpec;
  vegaSpec: Spec;
  view: View;
  warningsCount: number;
  warningsLogger: LocalLogger;
  themeName: string;
  backgroundColor: string;
}

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
  logLevel: 'Warn',
  logs: false,
  manualParse: false,
  mode: Mode.VegaLite,
  name: '',
  navItem: NAVBAR.Logs,
  parse: false,
  private: GistPrivacy.ALL,
  profilePicUrl: '',
  renderer: 'canvas',
  selectedExample: null,
  settings: false,
  sidePaneItem: SIDEPANE.Editor,
  signals: {},
  themeName: 'custom',
  tooltipEnable: true,
  vegaLiteSpec: null,
  vegaSpec: {},
  view: null,
  warningsCount: 0,
  warningsLogger: new LocalLogger(),
  backgroundColor: '#ffffff',
};
