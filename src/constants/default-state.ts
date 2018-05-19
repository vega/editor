import {LocalLogger} from '../utils/logger';
import {Mode, Renderer} from './consts';

export type State = {
  autoParse: boolean;
  baseURL: string;
  compiledVegaSpec: boolean;
  editorString: string;
  error: Error;
  errorPane: boolean;
  export: boolean;
  exportPDF: boolean;
  gist: string;
  mode: Mode;
  parse: boolean;
  renderer: Renderer;
  selectedExample: string;
  tooltip: boolean;
  vegaLiteSpec: any;
  vegaSpec: any;
  warningsLogger: LocalLogger;
};

export const DEFAULT_STATE: State = {
  autoParse: true,
  baseURL: null,
  compiledVegaSpec: false,
  editorString: '{}',
  error: null,
  errorPane: false,
  export: false,
  exportPDF: false,
  gist: null,
  mode: Mode.VegaLite,
  parse: false,
  renderer: 'canvas',
  selectedExample: null,
  tooltip: true,
  vegaLiteSpec: null,
  vegaSpec: {},
  warningsLogger: new LocalLogger(),
};
