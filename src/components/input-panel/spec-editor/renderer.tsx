import LZString from 'lz-string';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { withRouter } from 'react-router-dom';
import { debounce } from 'vega';
import parser from 'vega-schema-url-parser';
import { mapDispatchToProps, mapStateToProps } from '.';
import { KEYCODES, Mode } from '../../../constants';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & { history: any; match: any };

class Editor extends React.PureComponent<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.editorWillMount = this.editorWillMount.bind(this);
    this.editorDidMount = this.editorDidMount.bind(this);
    this.onSelectNewVegaLite = this.onSelectNewVegaLite.bind(this);
  }

  public handleKeydown(e) {
    if (this.props.manualParse) {
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

  public onSelectNewVega() {
    this.props.history.push('/custom/vega');
  }

  public onSelectNewVegaLite() {
    this.props.history.push('/custom/vega-lite');
  }

  public onClear() {
    this.props.mode === Mode.Vega ? this.onSelectNewVega() : this.onSelectNewVegaLite();
  }

  public editorDidMount(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    editor.addAction(
      (() => {
        return {
          id: 'CLEAR_EDITOR',
          label: 'Clear Editor',
          run: () => {
            this.onClear();
          },
        };
      })()
    );

    editor.focus();
  }

  public handleEditorChange(spec) {
    this.props.manualParse ? this.props.updateEditorString(spec) : this.updateSpec(spec);

    if (this.props.history.location.pathname.indexOf('/edited') === -1) {
      this.props.history.push('/edited');
    }
  }

  public editorWillMount(monaco: typeof Monaco) {
    const compressed = this.props.match.params.compressed;
    if (compressed) {
      const spec = LZString.decompressFromEncodedURIComponent(compressed);
      if (spec) {
        this.updateSpec(spec);
      } else {
        this.props.logError(`Failed to decompress URL. Expected a specification, but received ${spec}`);
      }
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.parse) {
      this.updateSpec(nextProps.value);
      this.props.setConfig(JSON.parse(nextProps.configEditorString));
      this.props.parseSpec(false);
    }
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    this.props.setEditorReference(this.refs.editor);
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  public updateSpec(spec: string) {
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

  public render() {
    return (
      <div className={'full-height-wrapper'}>
        <MonacoEditor
          ref="editor"
          language="json"
          options={{
            autoClosingBrackets: 'never',
            autoClosingQuotes: 'never',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          value={this.props.value}
          onChange={debounce(700, this.handleEditorChange)}
          editorWillMount={this.editorWillMount}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }
}

export default withRouter(Editor);
