export class LocalLogger {
  warns = [];
  infos = [];
  debugs = [];

  level() {
    return this;
  }

  warn(...args) {
    this.warns.push(...args);
    return this;
  }

  info(...args) {
    this.infos.push(...args);
    return this;
  }

  debug(...args) {
    this.debugs.push(...args);
    return this;
  }
}
