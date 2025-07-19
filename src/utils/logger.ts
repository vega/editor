import * as vega from 'vega';

export class LocalLogger implements vega.LoggerInterface {
  public readonly warns: string[] = [];
  public readonly infos: string[] = [];
  public readonly debugs: string[] = [];
  public readonly errors: string[] = [];

  #level = 0;

  constructor(private group: string = 'Vega-Editor') {
    this.#level = vega.Warn; // Default to warn level
  }

  level(_: number): this;
  level(): number;
  public level(_?: number) {
    if (arguments.length) {
      this.#level = +_;
      return this;
    } else {
      return this.#level;
    }
  }

  public warn(...args: any[]) {
    if (this.#level >= vega.Warn) {
      console.warn(`[${this.group}]`, ...args);
      this.warns.push(args.join(' '));
    }
    return this;
  }

  public info(...args: any[]) {
    if (this.#level >= vega.Info) {
      console.info(`[${this.group}]`, ...args);
      this.infos.push(args.join(' '));
    }
    return this;
  }

  public debug(...args: any[]) {
    if (this.#level >= vega.Debug) {
      console.debug(`[${this.group}]`, ...args);
      this.debugs.push(args.join(' '));
    }
    return this;
  }

  public error(...args: any[]) {
    // Always log errors regardless of level
    console.error(`[${this.group}]`, ...args);
    this.errors.push(args.join(' '));
    return this;
  }
}

export class DispatchingLogger implements vega.LoggerInterface {
  private setState: ((updater: (state: any) => any) => void) | null = null;
  private currentState: any = null;

  public initializeSetState(setState: (updater: (state: any) => any) => void) {
    this.setState = setState;
  }

  public updateCurrentState(state: any) {
    this.currentState = state;
  }

  level(_: number): this;
  level(): number;
  public level(_?: number) {
    if (!this.setState) {
      console.warn('DispatchingLogger: setState not initialized');
      return this;
    }

    if (arguments.length) {
      this.setState((state) => ({
        ...state,
        logLevel: _,
      }));
      return this;
    } else {
      // Return the current log level from state
      return this.currentState?.logLevel ?? vega.Warn;
    }
  }

  public warn = (...args: any[]) => {
    if (!this.setState) {
      console.warn('DispatchingLogger: setState not initialized');
      console.warn(...args);
      return this;
    }

    // Check if we should log at warn level
    if (this.level() >= vega.Warn) {
      console.warn(...args);

      this.setState((state) => ({
        ...state,
        warns: [...state.warns, args.join(' ')],
      }));
    }

    return this;
  };

  public info = (...args: any[]) => {
    if (!this.setState) {
      console.warn('DispatchingLogger: setState not initialized');
      console.info(...args);
      return this;
    }

    // Check if we should log at info level
    if (this.level() >= vega.Info) {
      console.info(...args);

      this.setState((state) => ({
        ...state,
        infos: [...state.infos, args.join(' ')],
      }));
    }

    return this;
  };

  public debug = (...args: any[]) => {
    if (!this.setState) {
      console.warn('DispatchingLogger: setState not initialized');
      console.debug(...args);
      return this;
    }

    // Check if we should log at debug level
    if (this.level() >= vega.Debug) {
      console.debug(...args);

      this.setState((state) => ({
        ...state,
        debugs: [...state.debugs, args.join(' ')],
      }));
    }

    return this;
  };

  public error = (...args: any[]) => {
    if (!this.setState) {
      console.warn('DispatchingLogger: setState not initialized');
      console.error(...args);
      return this;
    }

    // Always log errors regardless of level
    console.error(...args);

    this.setState((state) => ({
      ...state,
      errors: [...state.errors, args.join(' ')],
    }));

    return this;
  };
}

// Global logger instance for Vega view
export const dispatchingLogger = new DispatchingLogger();

// Legacy logger interface
// import * as vega from 'vega';
// import {Store} from 'redux';

// export class LocalLogger implements vega.LoggerInterface {
//   public readonly warns = [];
//   public readonly infos = [];
//   public readonly debugs = [];

//   #level = 0;

//   level(_: number): this;
//   level(): number;
//   public level(_?: number) {
//     if (arguments.length) {
//       this.#level = +_;
//       return this;
//     } else {
//       return this.#level;
//     }
//   }

//   public warn(...args: any[]) {
//     if (this.#level >= vega.Warn) {
//       this.warns.push(...args);
//     }
//     return this;
//   }

//   public info(...args: any[]) {
//     if (this.#level >= vega.Info) {
//       this.infos.push(...args);
//     }
//     return this;
//   }

//   public debug(...args: any[]) {
//     if (this.#level >= vega.Debug) {
//       this.debugs.push(...args);
//     }
//     return this;
//   }

//   public error(...args: any[]) {
//     throw new Error(...args);
//     return this;
//   }
// }

// export class DispatchingLogger implements vega.LoggerInterface {
//   private store: Store | null = null;

//   public initializeStore(store: Store) {
//     this.store = store;
//   }

//   public level = (_?: number) => {
//     if (!this.store) {
//       console.warn('DispatchingLogger: Store not initialized');
//       return this;
//     }

//     if (_ !== undefined) {
//       this.store.dispatch({
//         type: 'SET_LOG_LEVEL',
//         logLevel: _,
//       });
//       return this;
//     } else {
//       return this.store.getState().logLevel as any;
//     }
//   };

//   public warn = (...args: any[]) => {
//     if (!this.store) {
//       console.warn('DispatchingLogger: Store not initialized');
//       console.warn(...args);
//       return this;
//     }

//     if (this.level() >= vega.Warn) {
//       console.warn(...args);

//       this.store.dispatch({
//         type: 'WARN',
//         warn: args[0],
//       });
//     }

//     return this;
//   };

//   public info = (...args: any[]) => {
//     if (!this.store) {
//       console.warn('DispatchingLogger: Store not initialized');
//       console.info(...args);
//       return this;
//     }

//     if (this.level() >= vega.Info) {
//       console.info(...args);

//       this.store.dispatch({
//         type: 'INFO',
//         info: args[0],
//       });
//     }

//     return this;
//   };

//   public debug = (...args: any[]) => {
//     if (!this.store) {
//       console.warn('DispatchingLogger: Store not initialized');
//       console.debug(...args);
//       return this;
//     }

//     if (this.level() >= vega.Debug) {
//       console.debug(...args);

//       this.store.dispatch({
//         type: 'DEBUG',
//         debug: args[0],
//       });
//     }

//     return this;
//   };

//   public error = (...args: any[]) => {
//     if (!this.store) {
//       console.warn('DispatchingLogger: Store not initialized');
//       console.error(...args);
//       return this;
//     }

//     // TODO: remove as any
//     if (this.level() >= (vega as any).Error) {
//       console.warn(...args);

//       this.store.dispatch({
//         type: 'ERROR',
//         error: 'message' in args[0] ? args[0].message : args[0],
//       });
//     }

//     return this;
//   };
// }

// export const dispatchingLogger = new DispatchingLogger();
