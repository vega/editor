import type * as Monaco from 'monaco-editor';
import * as React from 'react';
import MonacoEditor from '@monaco-editor/react';
import ResizeObserver from 'rc-resize-observer';
import {useNavigate, useParams} from 'react-router';
import {connect} from 'react-redux';
import {debounce} from 'vega';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {SIDEPANE} from '../../constants/index.js';
import './config-editor.css';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    navigate: (path: string) => void;
    params: {compressed?: string};
  };

class ConfigEditor extends React.PureComponent<Props> {
  public editor: Monaco.editor.IStandaloneCodeEditor;
  public handleEditorChange = (spec: string) => {
    const newSpec = spec === '' ? '{}' : spec;
    this.props.setConfigEditorString(newSpec);
    this.props.setThemeName('custom');
    if (this.props.manualParse) {
      return;
    }
    this.props.setConfig(this.props.configEditorString);
  };

  public handleMergeConfig() {
    const confirmation = confirm('The spec will be formatted on merge.');
    if (!confirmation) {
      return;
    }
    this.props.navigate('/edited');
    this.props.mergeConfigSpec();
  }

  public handleExtractConfig() {
    const confirmation = confirm('The spec and config will be formatted.');
    if (!confirmation) {
      return;
    }

    this.props.extractConfig();
  }

  public handleEditorMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.onDidFocusEditorText(() => {
      editor.deltaDecorations(this.props.decorations, []);
      this.props.setEditorReference(editor);
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 0,
      id: 'MERGE_CONFIG',
      label: 'Merge Config Into Spec',
      run: this.handleMergeConfig.bind(this),
    });

    editor.addAction({
      contextMenuGroupId: 'vega',
      contextMenuOrder: 1,
      id: 'EXTRACT_CONFIG',
      label: 'Extract Config From Spec',
      run: this.handleExtractConfig.bind(this),
    });

    this.editor = editor;

    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.editor.focus();
      this.editor.layout();
    }
  }

  public componentDidMount() {
    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.props.setEditorReference(this.editor);
    }
  }

  public componentDidUpdate(prevProps, prevState) {
    if (this.props.sidePaneItem === SIDEPANE.Config) {
      this.editor.focus();
      this.editor.layout();
      this.props.setEditorReference(this.editor);
    }
  }

  public render() {
    return (
      <ResizeObserver
        onResize={({width, height}) => {
          this.editor?.layout({width, height});
        }}
      >
        <MonacoEditor
          defaultLanguage="json"
          options={{
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: {enabled: false},
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            quickSuggestions: true,
            stickyScroll: {
              enabled: false,
            },
          }}
          onChange={debounce(700, this.handleEditorChange)}
          defaultValue={this.props.configEditorString}
          onMount={(e) => this.handleEditorMount(e)}
        />
      </ResizeObserver>
    );
  }
}

const ConfigEditorWithNavigation = (props: Omit<Props, 'navigate' | 'params'>) => {
  const navigate = useNavigate();
  const params = useParams();
  return <ConfigEditor {...props} navigate={navigate} params={params} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigEditorWithNavigation);
