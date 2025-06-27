import * as vega from 'vega';

// eslint-disable-next-line no-shadow
export enum Mode {
  Vega = 'vega',
  VegaLite = 'vega-lite',
}

// eslint-disable-next-line no-shadow
export enum GistPrivacy {
  PUBLIC = 'PUBLIC',
  ALL = 'ALL',
}

export const NAME_TO_MODE = {
  vega: Mode.Vega,
  'vega-lite': Mode.VegaLite,
};

export const NAMES = {
  [Mode.Vega]: 'Vega',
  [Mode.VegaLite]: 'Vega-Lite',
};

export const LAYOUT = {
  DebugPaneSize: 200,
  HeaderHeight: 60,
  MinPaneSize: 30,
};

export const SCHEMA = {
  [Mode.Vega]: 'https://vega.github.io/schema/vega/v5.json',
  [Mode.VegaLite]: 'https://vega.github.io/schema/vega-lite/v5.json',
};

export const VEGA_START_SPEC = `{
  "$schema": "${SCHEMA.vega}"
}`;

export const VEGA_LITE_START_SPEC = `{
  "$schema": "${SCHEMA['vega-lite']}"
}`;

export type View = vega.View;

export const NAVBAR = {
  DataViewer: 'DataViewer',
  Logs: 'Logs',
  SignalViewer: 'SignalViewer',
  DataflowViewer: 'DataflowViewer',
} as const;

export const SIDEPANE = {
  Config: 'Config',
  Editor: 'Editor',
} as const;

export const COMPILEDPANE = {
  Vega: 'Vega',
  NormalizedVegaLite: 'NormalizedVegaLite',
} as const;

export const EDITOR_FOCUS = {
  CompiledEditor: 'compiled-editor',
  SpecEditor: 'spec-editor',
} as const;

export const KEYCODES = {
  B: 66,
  ESCAPE: 27,
  S: 83,
  SINGLE_QUOTE: 222,
  SLASH: 191,
};

/**
 * Taken from: https://github.com/microsoft/monaco-editor/blob/02fb6bfd43b5ddcff36c1a1303e4aac623deff2e/monaco.d.ts#L2602
 */
export const WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';

// Points to the server running from https://github.com/vega/editor-backend
export const BACKEND_URL =
  window.location.hostname === 'localhost' ? 'http://localhost:3000/' : 'https://vega-editor-backend.vercel.app/';

export const COOKIE_NAME = 'vega_session';
