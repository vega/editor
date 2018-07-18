import './index.css';

import stringify from 'json-stringify-pretty-compact';
import Monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { withRouter } from 'react-router-dom';
import parser from 'vega-schema-url-parser';

import { Mode } from '../../../constants';
import { DEFAULT_SCHEMAS } from '../../../constants/schemas';

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
  private monacoEditor: any;

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
  public updateEditorJsonLanguageSchemas(schemas) {
    this.monacoEditor.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: false,
      schemas,
      validate: true,
    });
  }
  public editorWillMount(monaco) {
    this.monacoEditor = monaco;
    this.updateEditorJsonLanguageSchemas(DEFAULT_SCHEMAS[this.props.mode]);

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
  public async updateSpec(spec) {
    let parsedMode = this.props.mode;

    try {
      const schemaUrl = JSON.parse(spec).$schema;

      if (schemaUrl) {
        switch (parser(schemaUrl).library) {
          case 'vega-lite':
            parsedMode = Mode.VegaLite;
            break;
          case 'vega':
            parsedMode = Mode.Vega;
            break;
        }
      }

      try {
        const schema = await fetch(schemaUrl).then(r => r.json());
        const schemas = DEFAULT_SCHEMAS[parsedMode].reduce((memo, item)=> {
          if (item.uri !== schemaUrl) {
            memo.push(item);
          }else {
            memo.push({
              schema,
              uri: schemaUrl
            })
          }
          return memo;
        }, []);

        this.updateEditorJsonLanguageSchemas(schemas)

      } catch (err) {
        console.warn('Error fetching JSON schema',err);
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
