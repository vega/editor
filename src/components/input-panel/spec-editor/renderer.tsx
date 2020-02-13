import stringify from 'json-stringify-pretty-compact';
import LZString from 'lz-string';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {debounce} from 'vega';
import parser from 'vega-schema-url-parser';
import {mapDispatchToProps, mapStateToProps} from '.';
import {EDITOR_FOCUS, KEYCODES, LAYOUT, Mode, SCHEMA, SIDEPANE} from '../../../constants';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  RouteComponentProps<{compressed: string}>;

class Editor extends React.PureComponent<Props, {}> {
  public editor: Monaco.editor.IStandaloneCodeEditor;
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

  public handleMergeConfig() {
    const confirmation = confirm('The spec will be formatted on merge.');
    if (!confirmation) {
      return;
    }
    if (this.props.history.location.pathname !== '/edited') {
      this.props.history.push('/edited');
    }
    this.props.mergeConfigSpec();
  }
  public handleExtractConfig() {
    const confirmation = confirm('The spec and config will be formatted.');
    if (!confirmation) {
      return;
    }

    this.props.extractConfigSpec();
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

  public addVegaSchemaURL() {
    let spec = JSON.parse(this.props.editorString);
    if (spec.$schema === undefined) {
      spec = {
        $schema: SCHEMA[Mode.Vega],
        ...spec
      };
      if (confirm('Adding schema URL will format the specification too.')) {
        this.props.updateVegaSpec(stringify(spec));
      }
    }
  }

  public addVegaLiteSchemaURL() {
    let spec = JSON.parse(this.props.editorString);
    if (spec.$schema === undefined) {
      spec = {
        $schema: SCHEMA[Mode.VegaLite],
        ...spec
      };
      if (confirm('Adding schema URL will format the specification too.')) {
        this.props.updateVegaLiteSpec(stringify(spec));
      }
    }
  }

  public editorDidMount(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    editor.onDidFocusEditorText(() => {
      this.props.compiledEditorRef && this.props.compiledEditorRef.deltaDecorations(this.props.decorations, []);
      editor.deltaDecorations(this.props.decorations, []);
      this.props.setEditorFocus(EDITOR_FOCUS.SpecEditor);
    });
    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 0,
      id: 'ADD_VEGA_SCHEMA',
      label: 'Add Vega schema URL',
      run: this.addVegaSchemaURL.bind(this)
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 1,
      id: 'ADD_VEGA_LITE_SCHEMA',
      label: 'Add Vega-Lite schema URL',
      run: this.addVegaLiteSchemaURL.bind(this)
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 2,
      id: 'CLEAR_EDITOR',
      label: 'Clear Spec',
      run: this.onClear.bind(this)
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 3,
      id: 'MERGE_CONFIG',
      label: 'Merge Config Into Spec',
      run: this.handleMergeConfig.bind(this)
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 4,
      id: 'EXTRACT_CONFIG',
      label: 'Extract Config From Spec',
      run: this.handleExtractConfig.bind(this)
    });

    editor.getModel().getOptions();

    this.editor = editor;

    if (this.props.sidePaneItem === SIDEPANE.Editor) {
      editor.focus();
      this.props.setEditorFocus(EDITOR_FOCUS.SpecEditor);
    }
  }

  public handleEditorChange(spec: string) {
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
        this.props.logError(new Error(`Failed to decompress URL. Expected a specification, but received ${spec}`));
      }
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.props.sidePaneItem === SIDEPANE.Editor) {
      if (prevProps.sidePaneItem !== this.props.sidePaneItem) {
        this.editor.focus();
        prevProps.setEditorReference(this.editor);
      }
    }

    if (prevProps.view !== this.props.view) {
      prevProps.compiledEditorRef && prevProps.compiledEditorRef.deltaDecorations(prevProps.decorations, []);
      prevProps.editorRef && prevProps.editorRef.deltaDecorations(prevProps.decorations, []);
    }

    if (this.props.parse) {
      this.props.editorRef.focus();
      this.updateSpec(this.props.value);
      prevProps.setConfig(this.props.configEditorString);
      prevProps.parseSpec(false);
    }
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    if (this.props.sidePaneItem === SIDEPANE.Editor) {
      this.props.setEditorReference(this.editor);
    }
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

  public getEditorHeight() {
    // height of header : 60
    // height of compiled Spec Header :30
    let height = window.innerHeight - 60 - LAYOUT.MinPaneSize - 30; // 60 is the height of header;
    if (this.props.compiledVegaSpec) {
      height -= this.props.compiledVegaPaneSize - 30;
    }
    return height;
  }

  public render() {
    return (
      <div
        className={this.props.mode === Mode.Vega ? 'full-height-wrapper' : ''}
        style={{
          display: this.props.sidePaneItem === SIDEPANE.Editor ? '' : 'none'
        }}
      >
        <MonacoEditor
          height={this.getEditorHeight()}
          ref="editor"
          language="json"
          options={{
            autoClosingBrackets: 'never',
            autoClosingQuotes: 'never',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: {enabled: false},
            scrollBeyondLastLine: false,
            wordWrap: 'on'
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
