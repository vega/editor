import { LocalLogger } from '../utils/logger';
import { Mode, Renderer, View } from './consts';

export interface State {
  autoParse: boolean;
  baseURL: string;
  compiledVegaSpec: boolean;
  debugPane: boolean;
  editorString: string;
  error: Error;
  export: boolean;
  format: boolean;
  gist: string;
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
  editorString: '{}',
  error: null,
  export: false,
  format: false,
  gist: null,
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
