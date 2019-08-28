import {Renderers} from 'vega';
import {Mode, View} from '../constants';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const RECEIVE_CURRENT_USER: 'RECEIVE_CURRENT_USER' = 'RECEIVE_CURRENT_USER';
export const EXPORT_VEGA: 'EXPORT_VEGA' = 'EXPORT_VEGA';
export const LOG_ERROR: 'LOG_ERROR' = 'LOG_ERROR';
export const PARSE_SPEC: 'PARSE_SPEC' = 'PARSE_SPEC';
export const SET_BASEURL: 'SET_BASEURL' = 'SET_BASEURL';
export const SET_COMPILED_VEGA_PANE_SIZE: 'SET_COMPILED_VEGA_PANE_SIZE' = 'SET_COMPILED_VEGA_PANE_SIZE';
export const SET_DEBUG_PANE_SIZE: 'SET_DEBUG_PANE_SIZE' = 'SET_DEBUG_PANE_SIZE';
export const SET_EDITOR_REFERENCE: 'SET_EDITOR_REFERENCE' = 'SET_EDITOR_REFERENCE';
export const SET_GIST_VEGA_LITE_SPEC: 'SET_GIST_VEGA_LITE_SPEC' = 'SET_GIST_VEGA_LITE_SPEC';
export const SET_GIST_VEGA_SPEC: 'SET_GIST_VEGA_SPEC' = 'SET_GIST_VEGA_SPEC';
export const SET_MODE: 'SET_MODE' = 'SET_MODE';
export const SET_MODE_ONLY: 'SET_MODE_ONLY' = 'SET_MODE_ONLY';
export const SET_SCROLL_POSITION: 'SET_SCROLL_POSITION' = 'SET_SCROLL_POSITION';
export const SET_RENDERER: 'SET_RENDERER' = 'SET_RENDERER';
export const SET_VEGA_EXAMPLE: 'SET_VEGA_EXAMPLE' = 'SET_VEGA_EXAMPLE';
export const SET_VEGA_LITE_EXAMPLE: 'SET_VEGA_LITE_EXAMPLE' = 'SET_VEGA_LITE_EXAMPLE';
export const SET_VIEW: 'SET_VIEW' = 'SET_VIEW';
export const SHOW_LOGS: 'SHOW_LOGS' = 'SHOW_LOGS';
export const TOGGLE_AUTO_PARSE: 'TOGGLE_AUTO_PARSE' = 'TOGGLE_AUTO_PARSE';
export const TOGGLE_COMPILED_VEGA_SPEC: 'TOGGLE_COMPILED_VEGA_SPEC' = 'TOGGLE_COMPILED_VEGA_SPEC';
export const TOGGLE_DEBUG_PANE: 'TOGGLE_DEBUG_PANE' = 'TOGGLE_DEBUG_PANE';
export const TOGGLE_NAV_BAR: 'TOGGLE_NAV_BAR' = 'TOGGLE_NAV_BAR';
export const UPDATE_EDITOR_STRING: 'UPDATE_EDITOR_STRING' = 'UPDATE_EDITOR_STRING';
export const UPDATE_VEGA_LITE_SPEC: 'UPDATE_VEGA_LITE_SPEC' = 'UPDATE_VEGA_LITE_SPEC';
export const UPDATE_VEGA_SPEC: 'UPDATE_VEGA_SPEC' = 'UPDATE_VEGA_SPEC';
export const SET_SETTINGS: 'SET_SETTINGS' = 'SET_SETTINGS';
export const SET_CONFIG: 'SET_CONFIG' = 'SET_CONFIG';
export const SET_THEME_NAME: 'SET_THEME_NAME' = 'SET_THEME_NAME';
export const SET_SIDEPANE_ITEM: 'SET_SIDEPANE_ITEM' = 'SET_SIDEPANE_ITEM';
export const SET_CONFIG_EDITOR_STRING: 'SET_CONFIG_EDITOR_STRING' = 'SET_CONFIG_EDITOR_STRING';
export const SET_LOG_LEVEL: 'SET_LOG_LEVEL' = 'SET_LOG_LEVEL';
export const SET_HOVER: 'SET_HOVER' = 'SET_HOVER';
export const SET_TOOLTIP: 'SET_TOOLTIP' = 'SET_TOOLTIP';
export const CLEAR_CONFIG: 'CLEAR_CONFIG' = 'CLEAR_CONFIG';
export const MERGE_CONFIG_SPEC: 'MERGE_CONFIG_SPEC' = 'MERGE_CONFIG_SPEC';
export const EXTRACT_CONFIG_SPEC: 'EXTRACT_CONFIG_SPEC' = 'EXTRACT_CONFIG_SPEC';
export const SET_DECORATION: 'SET_DECORATION' = 'SET_DECORATION';
export const SET_COMPILED_EDITOR_REFERENCE: 'SET_COMPILED_EDITOR_REFERENCE' = 'SET_COMPILED_EDITOR_REFERENCE';
export const SET_EDITOR_FOCUS: 'SET_EDITOR_FOCUS' = 'SET_EDITOR_FOCUS';

export type Action =
  | ReceiveCurrentUser
  | SetMode
  | SetModeOnly
  | SetScrollPosition
  | ParseSpec
  | SetVegaExample
  | SetVegaLiteExample
  | UpdateVegaSpec
  | UpdateVegaLiteSpec
  | SetGistVegaSpec
  | SetGistVegaLiteSpec
  | ToggleAutoParse
  | ToggleCompiledVegaSpec
  | ToggleDebugPane
  | ToggleNavbar
  | LogError
  | UpdateEditorString
  | ExportVega
  | SetRenderer
  | SetBaseUrl
  | SetView
  | SetDebugPaneSize
  | ShowLogs
  | SetCompiledVegaPaneSize
  | SetSettingsState
  | SetConfig
  | SetConfigEditorString
  | SetThemeName
  | SetSidePaneItem
  | SetEditorReference
  | SetLogLevel
  | SetHover
  | SetTooltip
  | ClearConfig
  | MergeConfigSpec
  | ExtractConfigSpec
  | SetDecorations
  | SetCompiledEditorRef
  | SetEditorFocus;

export function setMode(mode: Mode) {
  return {
    mode,
    type: SET_MODE,
  };
}
export type SetMode = ReturnType<typeof setMode>;

export function setModeOnly(mode: Mode) {
  return {
    mode,
    type: SET_MODE_ONLY,
  };
}
export type SetModeOnly = ReturnType<typeof setModeOnly>;

export function setScrollPosition(position: number) {
  return {
    position,
    type: SET_SCROLL_POSITION,
  };
}
export type SetScrollPosition = ReturnType<typeof setScrollPosition>;

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

export function toggleCompiledVegaSpec() {
  return {
    type: TOGGLE_COMPILED_VEGA_SPEC,
  };
}
export type ToggleCompiledVegaSpec = ReturnType<typeof toggleCompiledVegaSpec>;

export function toggleDebugPane() {
  return {
    type: TOGGLE_DEBUG_PANE,
  };
}
export type ToggleDebugPane = ReturnType<typeof toggleDebugPane>;

export function logError(err: Error) {
  return {
    error: {message: err.message},
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

export function exportVega(value: boolean) {
  return {
    export: value,
    type: EXPORT_VEGA,
  };
}
export type ExportVega = ReturnType<typeof exportVega>;

export function setRenderer(renderer: Renderers) {
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

export function setView(view: View) {
  return {
    type: SET_VIEW,
    view,
  };
}
export type SetView = ReturnType<typeof setView>;

export function setDebugPaneSize(size: number) {
  return {
    debugPaneSize: size,
    type: SET_DEBUG_PANE_SIZE,
  };
}
export type SetDebugPaneSize = ReturnType<typeof setDebugPaneSize>;

export function showLogs(value: boolean) {
  return {
    logs: value,
    type: SHOW_LOGS,
  };
}
export type ShowLogs = ReturnType<typeof showLogs>;

export function setCompiledVegaPaneSize(size: number) {
  return {
    compiledVegaPaneSize: size,
    type: SET_COMPILED_VEGA_PANE_SIZE,
  };
}

export type SetCompiledVegaPaneSize = ReturnType<typeof setCompiledVegaPaneSize>;

export function toggleNavbar(value: string) {
  return {
    navItem: value,
    type: TOGGLE_NAV_BAR,
  };
}

export type ToggleNavbar = ReturnType<typeof toggleNavbar>;

export function setSettingsState(value: boolean) {
  return {
    settings: value,
    type: SET_SETTINGS,
  };
}

export type SetSettingsState = ReturnType<typeof setSettingsState>;

export function setConfig(value: string) {
  return {
    configEditorString: value,
    type: SET_CONFIG,
  };
}

export type SetConfig = ReturnType<typeof setConfig>;

export function setConfigEditorString(value: string) {
  return {
    configEditorString: value,
    type: SET_CONFIG_EDITOR_STRING,
  };
}

export type SetConfigEditorString = ReturnType<typeof setConfigEditorString>;

export function setThemeName(value: string) {
  return {
    themeName: value,
    type: SET_THEME_NAME,
  };
}

export type SetThemeName = ReturnType<typeof setThemeName>;

export function setSidePaneItem(value: string) {
  return {
    sidePaneItem: value,
    type: SET_SIDEPANE_ITEM,
  };
}

export type SetSidePaneItem = ReturnType<typeof setSidePaneItem>;

export function setEditorReference(editorRef: Monaco.editor.IStandaloneCodeEditor) {
  return {
    editorRef: editorRef,
    type: SET_EDITOR_REFERENCE,
  };
}

export type SetEditorReference = ReturnType<typeof setEditorReference>;

export function setCompiledEditorRef(editorRef: Monaco.editor.IStandaloneCodeEditor) {
  return {
    editorRef: editorRef,
    type: SET_COMPILED_EDITOR_REFERENCE,
  };
}

export type SetCompiledEditorRef = ReturnType<typeof setCompiledEditorRef>;

export function setLogLevel(logLevel: string) {
  return {
    logLevel,
    type: SET_LOG_LEVEL,
  };
}

export type SetLogLevel = ReturnType<typeof setLogLevel>;

export function setHover(hover: boolean | 'auto') {
  return {
    hoverEnable: hover,
    type: SET_HOVER,
  };
}

export type SetHover = ReturnType<typeof setHover>;

export function setTooltip(tooltip: boolean) {
  return {
    tooltipEnable: tooltip,
    type: SET_TOOLTIP,
  };
}

export type SetTooltip = ReturnType<typeof setTooltip>;
export function clearConfig() {
  return {
    type: CLEAR_CONFIG,
  };
}

export type ClearConfig = ReturnType<typeof clearConfig>;

export function mergeConfigSpec() {
  return {
    type: MERGE_CONFIG_SPEC,
  };
}

export type MergeConfigSpec = ReturnType<typeof mergeConfigSpec>;

export function extractConfigSpec() {
  return {
    type: EXTRACT_CONFIG_SPEC,
  };
}

export type ExtractConfigSpec = ReturnType<typeof extractConfigSpec>;

export function setDecorations(value) {
  return {
    decoration: value,
    type: SET_DECORATION,
  };
}

export type SetDecorations = ReturnType<typeof setDecorations>;

export function setEditorFocus(value: string) {
  return {
    editorFocus: value,
    type: SET_EDITOR_FOCUS,
  };
}

export type SetEditorFocus = ReturnType<typeof setEditorFocus>;
export function receiveCurrentUser(isAuthenticated: boolean, handle?: string, name?: string, profilePicUrl?: string) {
  return {
    handle,
    isAuthenticated,
    name,
    profilePicUrl,
    type: RECEIVE_CURRENT_USER,
  };
}

export type ReceiveCurrentUser = ReturnType<typeof receiveCurrentUser>;
