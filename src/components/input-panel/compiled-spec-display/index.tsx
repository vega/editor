import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { connect } from 'react-redux';

import { State } from '../../../constants/default-state';
import CompiledSpecDisplayHeader from '../compiled-spec-header';

interface Props {
  value;
}

class CompiledSpecDisplay extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div className={'sizeFixEditorParent full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        <MonacoEditor
          options={{
            automaticLayout: true,
            folding: true,
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
          language="json"
          value={stringify(this.props.value)}
        />
      </div>
    );
  }
}

function mapStateToProps(state: State, ownProps) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    value: state.vegaSpec,
  };
}

export default connect(mapStateToProps)(CompiledSpecDisplay);
