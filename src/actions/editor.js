export const UPDATE_VEGA_SPEC = 'UPDATE_VEGA_SPEC';
export const UPDATE_VEGA_LITE_SPEC = 'UPDATE_VEGA_LITE_SPEC';
export const PARSE_SPEC = 'PARSE_SPEC';
export const SET_VEGA_EXAMPLE = 'SET_VEGA_EXAMPLE';
export const SET_VEGA_LITE_EXAMPLE = 'SET_VEGA_LITE_EXAMPLE';
export const SET_GIST_VEGA_SPEC = 'SET_GIST_VEGA_SPEC';
export const SET_GIST_VEGA_LITE_SPEC = 'SET_GIST_VEGA_LITE_SPEC';
export const TOGGLE_AUTO_PARSE = 'TOGGLE_AUTO_PARSE';
export const CYCLE_RENDERER = 'CYCLE_RENDERER';
export const SHOW_COMPILED_VEGA_SPEC = 'SHOW_COMPILED_VEGA_SPEC';
export const SET_MODE = 'SET_MODE';
export const SHOW_ERROR_PANE = 'SHOW_ERROR_PANE';
export const LOG_ERROR = 'LOG_ERROR';
export const UPDATE_EDITOR_STRING = 'UPDATE_EDITOR_STRING';
export const SHOW_TOOLTIP = 'SHOW_TOOLTIP';

export function setMode(mode) {
  return {
    type: SET_MODE,
    mode: mode
  }
}

export function parseSpec(value) {
  return {
    type: PARSE_SPEC,
    parse: value
  }
}

export function setVegaExample(example, spec) {
  return {
    type: SET_VEGA_EXAMPLE,
    spec: spec,
    example: example
  };
}

export function setVegaLiteExample(example, spec) {
  return {
    type: SET_VEGA_LITE_EXAMPLE,
    spec: spec,
    example: example
  };
}

export function updateVegaSpec(spec) {
  return {
    type: UPDATE_VEGA_SPEC,
    spec: spec
  };
}

export function updateVegaLiteSpec(spec) {
  return {
    type: UPDATE_VEGA_LITE_SPEC,
    spec: spec
  };
}

export function setGistVegaSpec(gist, spec) {
  return {
    type: SET_GIST_VEGA_SPEC,
    gist: gist,
    spec: spec
  };
}

export function setGistVegaLiteSpec(gist, spec) {
  return {
    type: SET_GIST_VEGA_LITE_SPEC,
    gist: gist,
    spec: spec
  };
}

export function toggleAutoParse() {
  return {
    type: TOGGLE_AUTO_PARSE
  };
}

export function cycleRenderer() {
  return {
    type: CYCLE_RENDERER
  };
}

export function showCompiledVegaSpec() {
  return {
    type: SHOW_COMPILED_VEGA_SPEC
  };
}

export function showErrorPane() {
  return {
    type: SHOW_ERROR_PANE
  }
}

export function logError(err) {
  return {
    type: LOG_ERROR,
    error: err
  }
}

export function updateEditorString(editorString) {
  return {
    type: UPDATE_EDITOR_STRING,
    editorString: editorString
  }
}

export function showTooltip() {
  return {
    type: SHOW_TOOLTIP
  }
}
