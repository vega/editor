import { Dataflow } from "vega-dataflow";

function hijack(key) {
  const originalMethod = Dataflow.prototype[key];
  Dataflow.prototype[key] = function (...args) {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const ss = now.getSeconds().toString().padStart(2, "0");
    const ms = now.getMilliseconds().toString().padStart(3, "0");
    const time = `${hh}:${mm}:${ss}.${ms}`;
    console.log(`[hijack ${time}] Dataflow.${key} has been called.`);
    return originalMethod.apply(this, args);
  };
}

[
  "add",
  "connect",
  "rank",
  "rerank",
  // OPERATOR UPDATES
  "pulse",
  "touch",
  "update",
  "changeset",
  // DATA LOADING
  "ingest",
  "parse",
  "preload",
  "request",
  // EVENT HANDLING
  "events",
  "on",
  // PULSE PROPAGATION
  "evaluate",
  "run",
  "runAsync",
  "runAfter",
].forEach(hijack);
