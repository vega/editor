import * as React from "react";
import { MODES } from "../../../constants";
import MonacoEditor from "react-monaco-editor";
import { withRouter } from "react-router-dom";
import parser from "vega-schema-url-parser";
import "./index.css";
const vegaSchema = require("../../../../schema/vega.schema.json");
const vegaLiteSchema = require("../../../../schema/vl.schema.json");
const schemas = {
  [MODES.Vega]: {
    uri: "https://vega.github.io/schema/vega/v3.0.json",
    schema: vegaSchema,
    fileMatch: ["*"]
  },
  [MODES.VegaLite]: {
    uri: "https://vega.github.io/schema/vega-lite/v2.json",
    schema: vegaLiteSchema,
    fileMatch: ["*"]
  }
};
function debounce(func, wait, immediate?) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

type Props = {
  autoParse
  history
  mode
  parse
  value?: string,

  onChange?: (...args: any[]) => any
  parseSpec
  updateEditorString
  updateVegaLiteSpec
  updateVegaSpec
};

type State = {
  code
};

class Editor extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      code: this.props.value
    };
  }
  editorDidMount(editor) {
    editor.focus();
  }
  handleEditorChange(spec) {
    if (this.props.autoParse) {
      this.updateSpec(spec);
    } else {
      this.props.updateEditorString(spec);
    }
    if (this.props.history.location.pathname.indexOf("/edited") === -1) {
      this.props.history.push("/edited");
    }
  }
  editorWillMount(monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [schemas[this.props.mode]]
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ code: nextProps.value });
    if (!nextProps.autoParse && nextProps.parse) {
      this.updateSpec(nextProps.value);
      this.props.parseSpec(false);
    }
  }
  manualParseSpec() {
    if (!this.props.autoParse) {
      return (
        <div className="editor-header">
          <button id="parse-button" onClick={() => this.props.parseSpec(true)}>
            Parse
          </button>
        </div>
      );
    }
  }
  updateSpec(spec) {
    let parsedMode = this.props.mode;
    try {
      const schema = JSON.parse(spec).$schema;
      parsedMode = parser(schema).library;
    } catch (err) {
      console.warn("Error parsing JSON string", err);
    }
    switch (parsedMode) {
      case MODES.Vega:
        this.props.updateVegaSpec(spec);
        break;
      case MODES.VegaLite:
        this.props.updateVegaLiteSpec(spec);
        break;
      default:
        console.error(`Unknown mode:  ${parsedMode}`);
        break;
    }
  }
  render() {
    const code = this.state.code;
    return (
      <div className={"full-height-wrapper"}>
        {this.manualParseSpec()}
        <MonacoEditor
          language="json"
          options={{
            folding: true,
            scrollBeyondLastLine: true,
            wordWrap: true,
            wrappingIndent: "same",
            automaticLayout: true,
            autoIndent: true,
            cursorBlinking: "smooth",
            lineNumbersMinChars: 4
          }}
          value={code}
          onChange={debounce(this.handleEditorChange, 700).bind(this)}
          editorWillMount={this.editorWillMount.bind(this)}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}
export default withRouter(Editor);
