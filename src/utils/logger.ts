export class LocalLogger {
  constructor(public readonly group: string) {}
  public warn(...args: any[]) {
    console.warn(`[${this.group}]`, ...args);
  }
  public info(...args: any[]) {
    console.info(`[${this.group}]`, ...args);
  }
  public error(...args: any[]) {
    console.error(`[${this.group}]`, ...args);
  }
}

export const dispatchingLogger = {
  level: (_level?: number) => dispatchingLogger,
  warn: (...args: any[]) => {
    console.warn(...args);
    return dispatchingLogger;
  },
  info: (...args: any[]) => {
    console.info(...args);
    return dispatchingLogger;
  },
  debug: (...args: any[]) => {
    console.debug(...args);
    return dispatchingLogger;
  },
  error: (...args: any[]) => {
    console.error(...args);
    return dispatchingLogger;
  },
};
