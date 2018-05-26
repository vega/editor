import { Mode, Renderer } from '../constants';

export const EXPORT_VEGA: 'EXPORT_VEGA' = 'EXPORT_VEGA';
export const FORMAT_SPEC: 'FORMAT_SPEC' = 'FORMAT_SPEC';
export const LOG_ERROR: 'LOG_ERROR' = 'LOG_ERROR';
export const PARSE_SPEC: 'PARSE_SPEC' = 'PARSE_SPEC';
export const SET_BASEURL: 'SET_BASEURL' = 'SET_BASEURL';
export const SET_DATASETS: 'SET_DATASETS' = 'SET_DATASETS';
export const SET_GIST_VEGA_LITE_SPEC: 'SET_GIST_VEGA_LITE_SPEC' = 'SET_GIST_VEGA_LITE_SPEC';
export const SET_GIST_VEGA_SPEC: 'SET_GIST_VEGA_SPEC' = 'SET_GIST_VEGA_SPEC';
export const SET_MODE: 'SET_MODE' = 'SET_MODE';
export const SET_RENDERER: 'SET_RENDERER' = 'SET_RENDERER';
export const SET_VEGA_EXAMPLE: 'SET_VEGA_EXAMPLE' = 'SET_VEGA_EXAMPLE';
export const SET_VEGA_LITE_EXAMPLE: 'SET_VEGA_LITE_EXAMPLE' = 'SET_VEGA_LITE_EXAMPLE';
export const SHOW_COMPILED_VEGA_SPEC: 'SHOW_COMPILED_VEGA_SPEC' = 'SHOW_COMPILED_VEGA_SPEC';
export const SHOW_ERROR_PANE: 'SHOW_ERROR_PANE' = 'SHOW_ERROR_PANE';
export const SHOW_TOOLTIP: 'SHOW_TOOLTIP' = 'SHOW_TOOLTIP';
export const TOGGLE_AUTO_PARSE: 'TOGGLE_AUTO_PARSE' = 'TOGGLE_AUTO_PARSE';
export const UPDATE_EDITOR_STRING: 'UPDATE_EDITOR_STRING' = 'UPDATE_EDITOR_STRING';
export const UPDATE_VEGA_LITE_SPEC: 'UPDATE_VEGA_LITE_SPEC' = 'UPDATE_VEGA_LITE_SPEC';
export const UPDATE_VEGA_SPEC: 'UPDATE_VEGA_SPEC' = 'UPDATE_VEGA_SPEC';

export type Action =
  | SetMode
  | ParseSpec
  | SetVegaExample
  | SetVegaLiteExample
  | UpdateVegaSpec
  | UpdateVegaLiteSpec
  | SetGistVegaSpec
  | SetGistVegaLiteSpec
  | ToggleAutoParse
  | ShowCompiledVegaSpec
  | ShowErrorPane
  | LogError
  | UpdateEditorString
  | ShowTooltip
  | ExportVega
  | SetRenderer
  | SetBaseUrl
  | FormatSpec
  | SetDataSets;

export function setMode(mode: Mode) {
  return {
    mode,
    type: SET_MODE,
  };
}
export type SetMode = ReturnType<typeof setMode>;

export function parseSpec(value: boolean) {
  return {
    parse: value,
    type: PARSE_SPEC,
  };
}
export type ParseSpec = ReturnType<typeof parseSpec>;

export function setVegaExample(example: string, spec) {
  return {
    example,
    spec,
    type: SET_VEGA_EXAMPLE,
  };
}
export type SetVegaExample = ReturnType<typeof setVegaExample>;

export function setVegaLiteExample(example: string, spec) {
  return {
    example,
    spec,
    type: SET_VEGA_LITE_EXAMPLE,
  };
}
export type SetVegaLiteExample = ReturnType<typeof setVegaLiteExample>;

export function updateVegaSpec(spec) {
  return {
    spec,
    type: UPDATE_VEGA_SPEC,
  };
}
export type UpdateVegaSpec = ReturnType<typeof updateVegaSpec>;

export function updateVegaLiteSpec(spec) {
  return {
    spec,
    type: UPDATE_VEGA_LITE_SPEC,
  };
}
export type UpdateVegaLiteSpec = ReturnType<typeof updateVegaLiteSpec>;

export function setGistVegaSpec(gist: string, spec) {
  return {
    gist,
    spec,
    type: SET_GIST_VEGA_SPEC,
  };
}
export type SetGistVegaSpec = ReturnType<typeof setGistVegaSpec>;

export function setGistVegaLiteSpec(gist: string, spec) {
  return {
    gist,
    spec,
    type: SET_GIST_VEGA_LITE_SPEC,
  };
}
export type SetGistVegaLiteSpec = ReturnType<typeof setGistVegaLiteSpec>;

export function toggleAutoParse() {
  return {
    type: TOGGLE_AUTO_PARSE,
  };
}
export type ToggleAutoParse = ReturnType<typeof toggleAutoParse>;

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
    error: err,
    type: LOG_ERROR,
  };
}
export type LogError = ReturnType<typeof logError>;

export function updateEditorString(editorString: string) {
  return {
    editorString,
    type: UPDATE_EDITOR_STRING,
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
    export: value,
    type: EXPORT_VEGA,
  };
}
export type ExportVega = ReturnType<typeof exportVega>;

export function setRenderer(renderer: Renderer) {
  return {
    renderer,
    type: SET_RENDERER,
  };
}
export type SetRenderer = ReturnType<typeof setRenderer>;

export function setBaseUrl(baseURL: string) {
  return {
    baseURL,
    type: SET_BASEURL,
  };
}
export type SetBaseUrl = ReturnType<typeof setBaseUrl>;

export function formatSpec(value: boolean) {
  return {
    format: value,
    type: FORMAT_SPEC,
  };
}
export type FormatSpec = ReturnType<typeof formatSpec>;

export function setDataSets(dataSets: any) {
  return {
    dataSets,
    type: SET_DATASETS,
  };
}
export type SetDataSets = ReturnType<typeof setDataSets>;
