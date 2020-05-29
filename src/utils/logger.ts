import {store} from './../index';
import {LoggerInterface} from 'vega';

export class LocalLogger implements LoggerInterface {
  public readonly warns = [];
  public readonly infos = [];
  public readonly debugs = [];

  private _level = 0;

  public level(_) {
    if (arguments.length) {
      this._level = +_;
      return this;
    } else {
      return this._level;
    }
  }

  public warn(...args: any[]) {
    this.warns.push(...args);
    return this;
  }

  public info(...args: any[]) {
    this.infos.push(...args);
    return this;
  }

  public debug(...args: any[]) {
    this.debugs.push(...args);
    return this;
  }

  public error(...args: any[]) {
    throw new Error(...args);
    return this;
  }
}

export class DispatchingLogger implements LoggerInterface {
  public level = (_?: number) => {
    if (_ !== undefined) {
      store.dispatch({
        type: 'SET_LOG_LEVEL',
        logLevel: _,
      });
      return this;
    } else {
      return store.getState().logLevel;
    }
  };

  public warn = (...args: any[]) => {
    console.warn(...args);

    store.dispatch({
      type: 'WARN',
      warn: args[0],
    });

    return this;
  };

  public info = (...args: any[]) => {
    console.info(...args);

    store.dispatch({
      type: 'INFO',
      info: args[0],
    });

    return this;
  };

  public debug = (...args: any[]) => {
    console.debug(...args);

    store.dispatch({
      type: 'DEBUG',
      debug: args[0],
    });

    return this;
  };

  public error = (...args: any[]) => {
    console.warn(...args);

    store.dispatch({
      type: 'ERROR',
      error: args[0],
    });

    return this;
  };
}

export const dispatchingLogger = new DispatchingLogger();
