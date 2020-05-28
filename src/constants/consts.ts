import * as vega from 'vega';

export namespace Mode {
  export const Vega = 'vega' as const;
  export const VegaLite = 'vega-lite' as const;
}

export namespace GistPrivacy {
  export const PUBLIC = 'PUBLIC' as const;
  export const ALL = 'ALL' as const;
}

export type Mode = typeof Mode.Vega | typeof Mode.VegaLite;

export type GistPrivacy = typeof GistPrivacy.ALL | typeof GistPrivacy.PUBLIC;

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
  [Mode.VegaLite]: 'https://vega.github.io/schema/vega-lite/v4.json',
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
} as const;

export const SIDEPANE = {
  Config: 'Config',
  Editor: 'Editor',
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

export const BACKEND_URL = 'https://vega.now.sh/';

export const COOKIE_NAME = 'vega_session';
