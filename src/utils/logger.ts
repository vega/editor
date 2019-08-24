import {LoggerInterface} from 'vega';

export class LocalLogger implements LoggerInterface {
  public readonly warns = [];
  public readonly infos = [];
  public readonly debugs = [];

  public level() {
    return this;
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
