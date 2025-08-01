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
