/* eslint-disable @typescript-eslint/ban-types */

declare module 'react-router-dom' {
  // working version of https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-router/index.d.ts
  // and https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-router-dom/index.d.ts

  import * as H from 'history';
  import {NavigateFunction, Location, Params} from 'react-router';

  export interface RouteChildrenProps<Params extends {[K in keyof Params]?: string} = {}, S = any> {
    history: H.History;
    location: H.Location;
    match: any;
  }

  export interface RouteProps {
    location?: H.Location;
    component?: React.ComponentType<any>;
    render?: (props: any) => React.ReactNode;
    children?: ((props: RouteChildrenProps<any>) => React.ReactNode) | React.ReactNode;
    path?: string | string[];
    exact?: boolean;
    sensitive?: boolean;
    strict?: boolean;
  }
  export class Route<T extends RouteProps = RouteProps> extends React.Component<T, any> {}

  export interface SwitchProps {
    children?: React.ReactNode;
    location?: H.Location;
  }
  export class Switch extends React.Component<SwitchProps, any> {}

  export class HashRouter extends React.Component<HashRouterProps, any> {}

  export interface HashRouterProps {
    basename?: string;
    getUserConfirmation?: (message: string, callback: (ok: boolean) => void) => void;
    hashType?: 'slash' | 'noslash' | 'hashbang';
    children?: React.ReactNode;
  }

  export type WithRouterProps<C extends React.ComponentType<any>> = C extends React.ComponentClass
    ? {wrappedComponentRef?: React.Ref<InstanceType<C>>}
    : {};

  export interface WithRouterStatics<C extends React.ComponentType<any>> {
    WrappedComponent: C;
  }

  // There is a known issue in TypeScript, which doesn't allow decorators to change the signature of the classes
  // they are decorating. Due to this, if you are using @withRouter decorator in your code,
  // you will see a bunch of errors from TypeScript. The current workaround is to use withRouter() as a function call
  // on a separate line instead of as a decorator.
  export function withRouter<P extends RouteComponentProps<any>, C extends React.ComponentType<P>>(
    component: C & React.ComponentType<P>,
  ): React.ComponentClass<Omit<P, keyof RouteComponentProps<any>> & WithRouterProps<C>> & WithRouterStatics<C>;

  export type RouteComponentProps<T = {}> = {
    history: any;
    location: any;
    match: any;
    staticContext?: any;
  } & T;
}

declare module '@tippyjs/react' {
  import React from 'react';

  export interface TippyProps {
    content: React.ReactNode;
    children: React.ReactElement;
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

declare module 'redux-thunk' {
  import {Middleware} from 'redux';

  const thunk: Middleware;
  export default thunk;
}

declare module 'react-split';
declare module '@monaco-editor/react';
declare module 'react-paginate';
declare module 'react-clipboard.js';
declare module 'rc-resize-observer';
declare module '@tippyjs/react';
declare module 'elkjs';
