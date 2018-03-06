import {LocalLogger} from '../utils/logger';
import {Mode, Renderer} from './consts';

export type State = {
  autoParse: boolean;
  compiledVegaSpec: boolean;
  editorString: string;
  error: Error;
  errorPane: boolean;
  export: boolean;
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
  compiledVegaSpec: false,
  editorString: '{}',
  error: null,
  errorPane: false,
  export: false,
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
