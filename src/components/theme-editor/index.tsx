import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { debounce } from 'vega';
import * as EditorActions from '../../actions/editor';
import ThemeEditorHeader from './theme-editor-header';
import './theme-editor.css';

class ThemeEditor extends React.Component<any, any> {
  public handleEditorChange = spec => {
    this.props.setCurrentTheme(JSON.parse(spec));
    (document.getElementById('theme_select') as any).value = 'custom';
  };
  public render() {
    return (
      <div className="sizeFixEditorParent full-height-wrapper">
        {/* <ThemeEditorHeader arrowToggle={this.props.arrowToggle} /> */}
        <MonacoEditor
          options={{
            automaticLayout: true,
            cursorBlinking: 'smooth',
            folding: true,
            lineNumbersMinChars: 4,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          ref="themeEditor"
          language="json"
          onChange={debounce(700, this.handleEditorChange)}
          value={stringify(this.props.theme)}
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theme: state.theme,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setCurrentTheme: EditorActions.setCurrentTheme,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThemeEditor);
