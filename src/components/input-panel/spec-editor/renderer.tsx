import './index.css';

import stringify from 'json-stringify-pretty-compact';
import Monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { withRouter } from 'react-router-dom';
import parser from 'vega-schema-url-parser';
import addMarkdownProps from '../../../utils/markdownProps';

import { Mode } from '../../../constants';

const vegaLiteSchema = require('vega-lite/build/vega-lite-schema.json');
const vegaSchema = require('vega/docs/vega-schema.json');

addMarkdownProps(vegaSchema);
addMarkdownProps(vegaLiteSchema);

const schemas = {
  [Mode.Vega]: [
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v3.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v3.0.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v3.1.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v4.json',
    },
  ],
  [Mode.VegaLite]: [
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.0.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.1.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.2.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.3.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.4.json',
    },
  ],
};

function debounce(func, wait, immediate?) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

interface Props {
  autoParse?: boolean;
  format?: boolean;
  history;
  mode: Mode;
  parse?: boolean;
  value?: string;

  onChange?: (...args: any[]) => any;
  parseSpec: (val: any) => void;
  formatSpec: (val: any) => void;
  updateEditorString: (val: any) => void;
  updateVegaLiteSpec: (val: any) => void;
  updateVegaSpec: (val: any) => void;
}

const KEYCODES = {
  B: 66,
  S: 83,
};

class Editor extends React.Component<Props, {}> {
  constructor(props) {
    super(props);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.editorWillMount = this.editorWillMount.bind(this);
    this.editorDidMount = this.editorDidMount.bind(this);
  }
  public handleKeydown(e) {
    if (!this.props.autoParse) {
      if ((e.keyCode === KEYCODES.B || e.keyCode === KEYCODES.S) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.props.parseSpec(true);
        const parseButton = this.refs.parse as any;
        parseButton.classList.add('pressed');
        setTimeout(() => {
          parseButton.classList.remove('pressed');
        }, 250);
      }
    }
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
      allowComments: false,
      schemas: schemas[this.props.mode],
      validate: true,
    });

    monaco.languages.registerDocumentFormattingEditProvider('json', {
      provideDocumentFormattingEdits(
        model: Monaco.editor.ITextModel,
        options: Monaco.languages.FormattingOptions,
        token: Monaco.CancellationToken
      ): Monaco.languages.TextEdit[] {
        return [
          {
            range: model.getFullModelRange(),
            text: stringify(JSON.parse(model.getValue())),
          },
        ];
      },
    });
  }
  public componentWillReceiveProps(nextProps: Props) {
    if (!nextProps.autoParse && nextProps.parse) {
      this.updateSpec(nextProps.value);
      this.props.parseSpec(false);
    }
    if (nextProps.format) {
      this.props.formatSpec(false);
    }
  }
  public componentDidUpdate() {
    if (this.props.format) {
      (this.refs.editor as any).editor.getAction('editor.action.formatDocument').run();
    }
  }
  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }
  public componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }
  public updateSpec(spec) {
    let parsedMode = this.props.mode;

    try {
      const schema = JSON.parse(spec).$schema;

      if (schema) {
        switch (parser(schema).library) {
          case 'vega-lite':
            parsedMode = Mode.VegaLite;
            break;
          case 'vega':
            parsedMode = Mode.Vega;
            break;
        }
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
        console.exception(`Unknown mode:  ${parsedMode}`);
        break;
    }
  }

  /**
   * Formats the editor code.
   * Triggered by #format-button on click.
   */
  public formatDocument() {
    (this.refs.editor as any).editor.getAction('editor.action.formatDocument').run();
  }

  public render() {
    return (
      <div className={'full-height-wrapper'}>
        <MonacoEditor
          ref="editor"
          language="json"
          options={{
            automaticLayout: true,
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          value={this.props.value}
          onChange={debounce(this.handleEditorChange, 700)}
          editorWillMount={this.editorWillMount}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}
export default withRouter(Editor);
