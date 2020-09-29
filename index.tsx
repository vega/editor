import "./hijack";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./helpers/icon";
import "./index.pcss";
import * as monaco from "monaco-editor";

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  enableSchemaRequest: true,
});

ReactDOM.render(<App />, document.getElementById("root"));
