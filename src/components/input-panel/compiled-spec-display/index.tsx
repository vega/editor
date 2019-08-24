import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import {connect} from 'react-redux';
import {LAYOUT} from '../../../constants';
import {State} from '../../../constants/default-state';
import CompiledSpecDisplayHeader from '../compiled-spec-header';

type Props = ReturnType<typeof mapStateToProps>;

class CompiledSpecDisplay extends React.PureComponent<Props> {
  public editor;
  public componentDidUpdate(prevProps) {
    if (this.props.compiledVegaPaneSize !== prevProps.compiledVegaPaneSize) {
      if (this.editor) {
        this.editor.layout();
      }
    }
  }

  public render() {
    return (
      <div className={'sizeFixEditorParent full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        <MonacoEditor
          height={this.props.compiledVegaPaneSize - LAYOUT.MinPaneSize}
          options={{
            automaticLayout: true,
            folding: true,
            minimap: {enabled: false},
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }}
          language="json"
          value={stringify(this.props.value)}
          editorDidMount={e => (this.editor = e)}
        />
      </div>
    );
  }
}

function mapStateToProps(state: State) {
  return {
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    value: state.vegaSpec
  };
}

export default connect(mapStateToProps)(CompiledSpecDisplay);
