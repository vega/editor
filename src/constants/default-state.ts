import {MODES, RENDERERS} from './consts';
import {LocalLogger} from '../utils/logger';

export type State = {
  autoParse: boolean;
  compiledVegaSpec: boolean;
  editorString: string;
  error: any;
  errorPane: boolean;
  gist: any;
  mode: string;
  parse: boolean;
  renderer: string;
  selectedExample: any;
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
  gist: null,
  mode: MODES.VegaLite,
  parse: false,
  renderer: RENDERERS.Canvas,
  selectedExample: null,
  tooltip: true,
  vegaLiteSpec: null,
  vegaSpec: {},
  warningsLogger: new LocalLogger(),
};
