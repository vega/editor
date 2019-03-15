import * as vega from 'vega';

export namespace Mode {
  export const Vega: 'vega' = 'vega';
  export const VegaLite: 'vega-lite' = 'vega-lite';
}

export type Mode = typeof Mode.Vega | typeof Mode.VegaLite;

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
  MinPaneSize: 25,
};

export type Renderer = 'svg' | 'canvas';

export const VEGA_START_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega/v4.json"
}`;

export const VEGA_LITE_START_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v3.json"
}`;

export type View = vega.View;

export const NAVBAR = {
  DataViewer: 'DataViewer',
  Logs: 'Logs',
  SignalViewer: 'SignalViewer',
};
