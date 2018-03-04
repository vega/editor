import './index.css';

import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {withRouter} from 'react-router-dom';
import parser from 'vega-schema-url-parser';

import {Mode} from '../../../constants';

const vegaSchema = require('../../../../schema/vega.schema.json');
const vegaLiteSchema = require('../../../../schema/vl.schema.json');

const schemas = {
  [Mode.Vega]: [{
    uri: 'https://vega.github.io/schema/vega/v3.json',
    schema: vegaSchema,
  }, {
    uri: 'https://vega.github.io/schema/vega/v3.0.json',
    schema: vegaSchema,
  }, {
    uri: 'https://vega.github.io/schema/vega/v3.1.json',
    schema: vegaSchema,
  }],
  [Mode.VegaLite]: [{
    uri: 'https://vega.github.io/schema/vega-lite/v2.json',
    schema: vegaLiteSchema,
  }, {
    uri: 'https://vega.github.io/schema/vega-lite/v2.0.json',
    schema: vegaLiteSchema,
  }, {
    uri: 'https://vega.github.io/schema/vega-lite/v2.1.json',
    schema: vegaLiteSchema,
  }],
};

function debounce(func, wait, immediate?) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) { func.apply(context, args); }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) { func.apply(context, args); }
  };
}

type Props = {
  autoParse: boolean;
  history;
  mode: Mode;
  parse: boolean;
  value?: string;

  onChange?: (...args: any[]) => any;
  parseSpec: Function;
  updateEditorString: Function;
  updateVegaLiteSpec: Function;
  updateVegaSpec: Function;
};

type State = {
  code;
};

class Editor extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      code: this.props.value,
    };
  }
  public editorDidMount(editor) {
    editor.focus();
  }
  public handleEditorChange(spec) {
    if (this.props.autoParse) {
      this.updateSpec(spec);
    } else {
      this.props.updateEditorString(spec);
    }
    if (this.props.history.location.pathname.indexOf('/edited') === -1) {
      this.props.history.push('/edited');
    }
  }
  public editorWillMount(monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: schemas[this.props.mode],
    });
  }
  public componentWillReceiveProps(nextProps) {
    this.setState({code: nextProps.value});
    if (!nextProps.autoParse && nextProps.parse) {
      this.updateSpec(nextProps.value);
      this.props.parseSpec(false);
    }
  }
  public manualParseSpec() {
    if (!this.props.autoParse) {
      return (
        <button id='parse-button' className='button' onClick={() => this.props.parseSpec(true)}>
          Parse
        </button>
      );
    }
  }
  public updateSpec(spec) {
    let parsedMode = this.props.mode;

    try {
      const schema = JSON.parse(spec).$schema;

      switch (parser(schema).library) {
        case 'vega-lite':
          parsedMode = Mode.VegaLite;
          break;
        case 'vega':
          parsedMode = Mode.Vega;
          break;
      }
    } catch (err) {
      console.warn('Error parsing JSON string', err);
    }

    switch (parsedMode) {
      case Mode.Vega:
        this.props.updateVegaSpec(spec);
        break;
      case Mode.VegaLite:
        this.props.updateVegaLiteSpec(spec);
        break;
      default:
        console.error(`Unknown mode:  ${parsedMode}`);
        break;
    }
  }

  /**
   * Formats the editor code.
   * Triggered by #format-button on click.
   */
  public formatDocument() {
    (this.refs.vegaEditor as any)
      .editor
      .getAction('editor.action.formatDocument')
      .run();
  }

  public render() {
    const code = this.state.code;
    return (
      <div className={'full-height-wrapper'}>
        <div className='editor-header right-align'>
          <button id='format-button' className='button' onClick={() => this.formatDocument()}>
            Format
          </button>
          {this.manualParseSpec()}
        </div>
        <MonacoEditor
          ref='vegaEditor'
          language='json'
          options={{
            folding: true,
            scrollBeyondLastLine: true,
            wordWrap: true,
            wrappingIndent: 'same',
            automaticLayout: true,
            autoIndent: true,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 4,
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
