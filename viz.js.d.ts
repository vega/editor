declare module 'viz.js' {
  import { Module, render } from 'viz.js/full.render';

  interface VizConstructorParameters {
    Module: Module;
    render: render;
  }

  export default class Viz {
    constructor(parameters: VizConstructorParameters);
    renderSVGElement(dot: string): Promise<SVGSVGElement>;
  }
}

declare module 'viz.js/full.render' {
  export const Module: unique symbol;
  export const render: unique symbol;
}
