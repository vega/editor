/* eslint-disable @typescript-eslint/ban-types */

// TODO: Use default types from packages
// Current Issues: For a lot of the components,
// our usage isn't compatible with the default type definitions.

declare module '@tippyjs/react' {
  import React from 'react';

  export interface TippyProps {
    content: React.ReactNode;
    animation?: string;
    arrow?: boolean;
    delay?: number | [number, number];
    duration?: number | [number, number];
    interactive?: boolean;
    placement?: string;
    theme?: string;
    trigger?: string;
    [key: string]: any;
  }

  const Tippy: React.FC<TippyProps>;
  export default Tippy;
}

// Fix for library constructors
declare module 'elkjs' {
  export interface ElkNode {
    id?: string;
    children?: ElkNode[];
    ports?: any[];
    edges?: any[];
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    [key: string]: any;
  }

  export interface LayoutOptions {
    [key: string]: any;
  }

  class ELK {
    constructor(options?: any);
    layout(graph: ElkNode, options?: any): Promise<ElkNode>;
  }

  export default ELK;
}

declare module 'ajv' {
  const Ajv: any;
  export default Ajv;
}

declare module 'ajv-formats' {
  const addFormats: any;
  export default addFormats;
}

declare module 'react-split';
declare module '@monaco-editor/react';
declare module 'react-paginate';
declare module 'react-clipboard.js';
declare module 'rc-resize-observer';
declare module '@tippyjs/react';
declare module 'elkjs';
