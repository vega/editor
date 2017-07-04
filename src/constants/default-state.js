import {MODES, RENDERERS} from './consts';
import {logger} from '../utils/logger'

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
  warningsLogger: logger
}
