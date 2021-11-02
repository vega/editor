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
    component: C & React.ComponentType<P>
  ): React.ComponentClass<Omit<P, keyof RouteComponentProps<any>> & WithRouterProps<C>> & WithRouterStatics<C>;

  export type RouteComponentProps<T = {}> = {
    history: any;
    location: any;
    match: any;
    staticContext?: any;
  } & T;
}
