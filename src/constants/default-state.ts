import { Spec } from 'vega';
import { TopLevelSpec as VlSpec } from 'vega-lite';
import { LocalLogger } from '../utils/logger';
import { LAYOUT, Mode, NAVBAR, Renderer, SIDEPANE, VEGA_LITE_START_SPEC, View } from './consts';

export interface State {
  baseURL: string;
  compiledVegaSpec: boolean;
  compiledVegaPaneSize: number;
  debugPane: boolean;
  debugPaneSize: number;
  editorString: string;
  error: Error;
  export: boolean;
  format: boolean;
  gist: string;
  lastPosition: number;
  logs: boolean;
  manualParse: boolean;
  mode: Mode;
  navItem: string;
  sidePaneItem: string;
  parse: boolean;
  renderer: Renderer;
  selectedExample: string;
  vegaLiteSpec: VlSpec;
  vegaSpec: Spec;
  view: View;
  warningsCount: number;
  warningsLogger: LocalLogger;
  theme: any;
}

export const DEFAULT_STATE: State = {
  baseURL: null,
  compiledVegaPaneSize: LAYOUT.MinPaneSize,
  compiledVegaSpec: false,
  debugPane: false,
  debugPaneSize: LAYOUT.MinPaneSize,
  editorString: VEGA_LITE_START_SPEC,
  error: null,
  export: false,
  format: false,
  gist: null,
  lastPosition: 0,
  logs: false,
  manualParse: false,
  mode: Mode.VegaLite,
  navItem: NAVBAR.Logs,
  parse: false,
  renderer: 'canvas',
  selectedExample: null,
  sidePaneItem: SIDEPANE.CompiledVega,
  theme: {},
  vegaLiteSpec: null,
  vegaSpec: {},
  view: null,
  warningsCount: 0,
  warningsLogger: new LocalLogger(),
};
