/* eslint-disable @typescript-eslint/ban-types */

declare module 'react-router-dom' {
  // working version of https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-router/index.d.ts
  // and https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-router-dom/index.d.ts

  import * as H from 'history';

  export interface RouteChildrenProps<Params extends {[K in keyof Params]?: string} = {}, S = any> {
    history: H.History;
    location: H.Location;
    match: any;
  }

  export interface RouteProps {
    location?: H.Location;
    component?: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
    render?: (props: RouteComponentProps<any>) => React.ReactNode;
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

declare module 'react-split-pane-r17' {
  import React from 'react';

  interface SplitPaneProps {
    split?: 'vertical' | 'horizontal';
    minSize?: number;
    maxSize?: number;
    defaultSize?: number | string;
    size?: number | string;
    step?: number;
    onDragStarted?: () => void;
    onDragFinished?: (newSize: number) => void;
    onChange?: (newSize: number) => void;
    pane1Style?: React.CSSProperties;
    pane2Style?: React.CSSProperties;
    paneStyle?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  const SplitPane: React.FC<SplitPaneProps>;
  export default SplitPane;
}

declare module '@monaco-editor/react' {
  import React from 'react';

  export interface MonacoEditorProps {
    value?: string;
    defaultValue?: string;
    language?: string;
    theme?: string;
    options?: any;
    overrideServices?: any;
    width?: number | string;
    height?: number | string;
    className?: string;
    beforeMount?: (monaco: any) => void;
    onMount?: (editor: any, monaco: any) => void;
    onChange?: (value: string, event: any) => void;
    onValidate?: (markers: any[]) => void;
    [key: string]: any;
  }

  const MonacoEditor: React.FC<MonacoEditorProps>;
  export default MonacoEditor;

  export const loader: {
    init: () => Promise<any>;
    config: (options: any) => void;
  };
}

declare module 'react-paginate' {
  import React from 'react';

  interface ReactPaginateProps {
    pageCount: number;
    pageRangeDisplayed?: number;
    marginPagesDisplayed?: number;
    previousLabel?: React.ReactNode;
    nextLabel?: React.ReactNode;
    breakLabel?: React.ReactNode;
    breakClassName?: string;
    breakLinkClassName?: string;
    onPageChange?: (selectedItem: {selected: number}) => void;
    initialPage?: number;
    forcePage?: number;
    disableInitialCallback?: boolean;
    containerClassName?: string;
    pageClassName?: string;
    pageLinkClassName?: string;
    activeClassName?: string;
    activeLinkClassName?: string;
    previousClassName?: string;
    nextClassName?: string;
    previousLinkClassName?: string;
    nextLinkClassName?: string;
    disabledClassName?: string;
    [key: string]: any;
  }

  const ReactPaginate: React.FC<ReactPaginateProps>;
  export default ReactPaginate;
}

declare module 'react-clipboard.js' {
  import React from 'react';

  interface ClipboardProps {
    'data-clipboard-text'?: string;
    option?: any;
    onSuccess?: (e: any) => void;
    onError?: (e: any) => void;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [key: string]: any;
  }

  const Clipboard: React.FC<ClipboardProps>;
  export default Clipboard;
}

declare module 'rc-resize-observer' {
  import React from 'react';

  interface ResizeObserverProps {
    onResize?: (size: {width: number; height: number}) => void;
    disabled?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  const ResizeObserver: React.FC<ResizeObserverProps>;
  export default ResizeObserver;
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
