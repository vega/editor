import {Renderers, Spec} from 'vega';
import {TopLevelSpec as VlSpec} from 'vega-lite';
import {Config} from 'vega-themes/build/config';
import {LocalLogger} from '../utils/logger';
import {LAYOUT, Mode, NAVBAR, SIDEPANE, VEGA_LITE_START_SPEC, View} from './consts';

export interface State {
  isAuthenticated: boolean;
  baseURL: string;
  compiledVegaSpec: boolean;
  compiledVegaPaneSize: number;
  config: Config;
  configEditorString: string;
  debugPane: boolean;
  debugPaneSize: number;
  editorRef: any;
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
}

export const DEFAULT_STATE: State = {
  baseURL: null,
  compiledVegaPaneSize: LAYOUT.MinPaneSize,
  compiledVegaSpec: false,
  config: {},
  configEditorString: '{}',
  debugPane: false,
  debugPaneSize: LAYOUT.MinPaneSize,
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
  warningsLogger: new LocalLogger()
};
