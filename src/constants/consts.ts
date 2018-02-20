export enum Mode {
  Vega,
  VegaLite
}

export const NAME_TO_MODE = {
  Vega: Mode.Vega,
  VegaLite: Mode.VegaLite
};

export const NAMES = {
  [Mode.Vega]: 'Vega',
  [Mode.VegaLite]: 'Vega-Lite'
};

export const LAYOUT = {HeaderHeight: 56};

export type Renderer = 'svg' | 'canvas';

export const VEGA_START_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega/v3.0.json"
}`;

export const VEGA_LITE_START_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json"
}`;
