export enum Mode {
  Vega,
  VegaLite
}

export const LAYOUT = {HeaderHeight: 56};

export const RENDERERS = {SVG: 'svg', Canvas: 'canvas'};

export const VEGA_START_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega/v3.0.json"
}`;

export const VEGA_LITE_START_SPEC = `{
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json"
}`;
