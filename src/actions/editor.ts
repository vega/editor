import {Mode} from '../constants';

export const EXPORT_VEGA: 'EXPORT_VEGA' = 'EXPORT_VEGA';
export const CYCLE_RENDERER: 'CYCLE_RENDERER' = 'CYCLE_RENDERER';
export const LOG_ERROR: 'LOG_ERROR' = 'LOG_ERROR';
export const PARSE_SPEC: 'PARSE_SPEC' = 'PARSE_SPEC';
export const SET_GIST_VEGA_LITE_SPEC: 'SET_GIST_VEGA_LITE_SPEC' = 'SET_GIST_VEGA_LITE_SPEC';
export const SET_GIST_VEGA_SPEC: 'SET_GIST_VEGA_SPEC' = 'SET_GIST_VEGA_SPEC';
export const SET_MODE: 'SET_MODE' = 'SET_MODE';
export const SET_VEGA_EXAMPLE: 'SET_VEGA_EXAMPLE' = 'SET_VEGA_EXAMPLE';
export const SET_VEGA_LITE_EXAMPLE: 'SET_VEGA_LITE_EXAMPLE' = 'SET_VEGA_LITE_EXAMPLE';
export const SHOW_COMPILED_VEGA_SPEC: 'SHOW_COMPILED_VEGA_SPEC' = 'SHOW_COMPILED_VEGA_SPEC';
export const SHOW_ERROR_PANE: 'SHOW_ERROR_PANE' = 'SHOW_ERROR_PANE';
export const SHOW_TOOLTIP: 'SHOW_TOOLTIP' = 'SHOW_TOOLTIP';
export const TOGGLE_AUTO_PARSE: 'TOGGLE_AUTO_PARSE' = 'TOGGLE_AUTO_PARSE';
export const UPDATE_EDITOR_STRING: 'UPDATE_EDITOR_STRING' = 'UPDATE_EDITOR_STRING';
export const UPDATE_VEGA_LITE_SPEC: 'UPDATE_VEGA_LITE_SPEC' = 'UPDATE_VEGA_LITE_SPEC';
export const UPDATE_VEGA_SPEC: 'UPDATE_VEGA_SPEC' = 'UPDATE_VEGA_SPEC';

export type Action = SetMode | ParseSpec | SetVegaExample | SetVegaLiteExample | UpdateVegaSpec | UpdateVegaLiteSpec | SetGistVegaSpec | SetGistVegaLiteSpec | ToggleAutoParse | CycleRenderer | ShowCompiledVegaSpec | ShowErrorPane | LogError | UpdateEditorString | ShowTooltip | ExportVega;

export function setMode(mode: Mode) {
  return {
    type: SET_MODE,
    mode: mode,
  };
}
export type SetMode = ReturnType<typeof setMode>;

export function parseSpec(value: boolean) {
  return {
    type: PARSE_SPEC,
    parse: value,
  };
}
export type ParseSpec = ReturnType<typeof parseSpec>;

export function setVegaExample(example: string, spec) {
  return {
    type: SET_VEGA_EXAMPLE,
    spec: spec,
    example: example,
  };
}
export type SetVegaExample = ReturnType<typeof setVegaExample>;

export function setVegaLiteExample(example: string, spec) {
  return {
    type: SET_VEGA_LITE_EXAMPLE,
    spec: spec,
    example: example,
  };
}
export type SetVegaLiteExample = ReturnType<typeof setVegaLiteExample>;

export function updateVegaSpec(spec) {
  return {
    type: UPDATE_VEGA_SPEC,
    spec: spec,
  };
}
export type UpdateVegaSpec = ReturnType<typeof updateVegaSpec>;

export function updateVegaLiteSpec(spec) {
  return {
    type: UPDATE_VEGA_LITE_SPEC,
    spec: spec,
  };
}
export type UpdateVegaLiteSpec = ReturnType<typeof updateVegaLiteSpec>;

export function setGistVegaSpec(gist: string, spec) {
  return {
    type: SET_GIST_VEGA_SPEC,
    gist: gist,
    spec: spec,
  };
}
export type SetGistVegaSpec = ReturnType<typeof setGistVegaSpec>;

export function setGistVegaLiteSpec(gist: string, spec) {
  return {
    type: SET_GIST_VEGA_LITE_SPEC,
    gist: gist,
    spec: spec,
  };
}
export type SetGistVegaLiteSpec = ReturnType<typeof setGistVegaLiteSpec>;

export function toggleAutoParse() {
  return {
    type: TOGGLE_AUTO_PARSE,
  };
}
export type ToggleAutoParse = ReturnType<typeof toggleAutoParse>;

export function cycleRenderer() {
  return {
    type: CYCLE_RENDERER,
  };
}
export type CycleRenderer = ReturnType<typeof cycleRenderer>;

export function showCompiledVegaSpec() {
  return {
    type: SHOW_COMPILED_VEGA_SPEC,
  };
}
export type ShowCompiledVegaSpec = ReturnType<typeof showCompiledVegaSpec>;

export function showErrorPane() {
  return {
    type: SHOW_ERROR_PANE,
  };
}
export type ShowErrorPane = ReturnType<typeof showErrorPane>;

export function logError(err) {
  return {
    type: LOG_ERROR,
    error: err,
  };
}
export type LogError = ReturnType<typeof logError>;

export function updateEditorString(editorString: string) {
  return {
    type: UPDATE_EDITOR_STRING,
    editorString: editorString,
  };
}
export type UpdateEditorString = ReturnType<typeof updateEditorString>;

export function showTooltip() {
  return {
    type: SHOW_TOOLTIP,
  };
}
export type ShowTooltip = ReturnType<typeof showTooltip>;

export function exportVega(value: boolean) {
  return {
    type: EXPORT_VEGA,
    export: value,
  };
}
export type ExportVega = ReturnType<typeof exportVega>;
