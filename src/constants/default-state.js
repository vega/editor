import {MODES, RENDERERS} from './consts';
import {LocalLogger} from '../utils/logger';

export const DEFAULT_STATE = {
  editorString: '{}',
  vegaSpec: {},
  vegaLiteSpec: null,
  selectedExample: null,
  mode: MODES.Vega,
  renderer: RENDERERS.Canvas,
  autoParse: true,
  parse: false,
  compiledVegaSpec: false,
  gist: null,
  error: null,
  errorPane: false,
  warningsLogger: new LocalLogger(),
  tooltip: true
}
