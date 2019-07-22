import { EncodeEntryName, Spec } from 'vega';
import { TopLevelSpec as VlSpec } from 'vega-lite';
import { Config } from 'vega-themes/build/config';
import { LocalLogger } from '../utils/logger';
import { LAYOUT, Mode, NAVBAR, Renderer, SIDEPANE, VEGA_LITE_START_SPEC, View } from './consts';

export interface State {
  baseURL: string;
  compiledVegaSpec: boolean;
  compiledVegaPaneSize: number;
  config: Config;
  configEditorString: string;
  debugPane: boolean;
  debugPaneSize: number;
  editorRef: any;
  editorString: string;
  error: Error;
  export: boolean;
  gist: string;
  hoverEnable: boolean | 'auto';
  logLevel: string;
  lastPosition: number;
  logs: boolean;
  manualParse: boolean;
  mode: Mode;
  navItem: string;
  sidePaneItem: string;
  parse: boolean;
  renderer: Renderer;
  selectedExample: string;
  settings: boolean;
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
  hoverEnable: 'auto',
  lastPosition: 0,
  logLevel: 'Warn',
  logs: false,
  manualParse: false,
  mode: Mode.VegaLite,
  navItem: NAVBAR.Logs,
  parse: false,
  renderer: 'canvas',
  selectedExample: null,
  settings: false,
  sidePaneItem: SIDEPANE.CompiledVega,
  themeName: 'custom',
  tooltipEnable: true,
  vegaLiteSpec: null,
  vegaSpec: {},
  view: null,
  warningsCount: 0,
  warningsLogger: new LocalLogger(),
};
