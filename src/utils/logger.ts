export class LocalLogger {
  private readonly warns = [];
  private readonly infos = [];
  private readonly debugs = [];

  public level() {
    return this;
  }

  public warn(...args) {
    this.warns.push(...args);
    return this;
  }

  public info(...args) {
    this.infos.push(...args);
    return this;
  }

  public debug(...args) {
    this.debugs.push(...args);
    return this;
  }

  public error(...args) {
    throw new Error(...args);
  }
}
