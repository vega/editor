import * as vega from 'vega';
import {Store} from 'redux';

export class LocalLogger implements vega.LoggerInterface {
  public readonly warns = [];
  public readonly infos = [];
  public readonly debugs = [];

  #level = 0;

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
      this.warns.push(...args);
    }
    return this;
  }

  public info(...args: any[]) {
    if (this.#level >= vega.Info) {
      this.infos.push(...args);
    }
    return this;
  }

  public debug(...args: any[]) {
    if (this.#level >= vega.Debug) {
      this.debugs.push(...args);
    }
    return this;
  }

  public error(...args: any[]) {
    throw new Error(...args);
    return this;
  }
}

export class DispatchingLogger implements vega.LoggerInterface {
  private store: Store | null = null;

  public initializeStore(store: Store) {
    this.store = store;
  }

  public level = (_?: number) => {
    if (!this.store) {
      console.warn('DispatchingLogger: Store not initialized');
      return this;
    }

    if (_ !== undefined) {
      this.store.dispatch({
        type: 'SET_LOG_LEVEL',
        logLevel: _,
      });
      return this;
    } else {
      return this.store.getState().logLevel as any;
    }
  };

  public warn = (...args: any[]) => {
    if (!this.store) {
      console.warn('DispatchingLogger: Store not initialized');
      console.warn(...args);
      return this;
    }

    if (this.level() >= vega.Warn) {
      console.warn(...args);

      this.store.dispatch({
        type: 'WARN',
        warn: args[0],
      });
    }

    return this;
  };

  public info = (...args: any[]) => {
    if (!this.store) {
      console.warn('DispatchingLogger: Store not initialized');
      console.info(...args);
      return this;
    }

    if (this.level() >= vega.Info) {
      console.info(...args);

      this.store.dispatch({
        type: 'INFO',
        info: args[0],
      });
    }

    return this;
  };

  public debug = (...args: any[]) => {
    if (!this.store) {
      console.warn('DispatchingLogger: Store not initialized');
      console.debug(...args);
      return this;
    }

    if (this.level() >= vega.Debug) {
      console.debug(...args);

      this.store.dispatch({
        type: 'DEBUG',
        debug: args[0],
      });
    }

    return this;
  };

  public error = (...args: any[]) => {
    if (!this.store) {
      console.warn('DispatchingLogger: Store not initialized');
      console.error(...args);
      return this;
    }

    // TODO: remove as any
    if (this.level() >= (vega as any).Error) {
      console.warn(...args);

      this.store.dispatch({
        type: 'ERROR',
        error: 'message' in args[0] ? args[0].message : args[0],
      });
    }

    return this;
  };
}

export const dispatchingLogger = new DispatchingLogger();
