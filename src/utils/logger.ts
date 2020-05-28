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
