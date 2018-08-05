import { LocalLogger } from '../utils/logger';
import { Mode, Renderer, View } from './consts';

export interface State {
  autoParse: boolean;
  baseURL: string;
  compiledVegaSpec: boolean;
  debugPane: boolean;
  debugPaneSize: number;
  editorString: string;
  error: Error;
  export: boolean;
  format: boolean;
  gist: string;
  logs: boolean;
  mode: Mode;
  parse: boolean;
  renderer: Renderer;
  selectedExample: string;
  tooltip: boolean;
  vegaLiteSpec: any;
  vegaSpec: any;
  view: View;
  warningsLogger: LocalLogger;
}

export const DEFAULT_STATE: State = {
  autoParse: true,
  baseURL: null,
  compiledVegaSpec: false,
  debugPane: false,
  debugPaneSize: null,
  editorString: '{}',
  error: null,
  export: false,
  format: false,
  gist: null,
  logs: true,
  mode: Mode.VegaLite,
  parse: false,
  renderer: 'canvas',
  selectedExample: null,
  tooltip: true,
  vegaLiteSpec: null,
  vegaSpec: {},
  view: null,
  warningsLogger: new LocalLogger(),
};
