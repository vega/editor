import * as stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { connect } from 'react-redux';

import { showCompiledVegaSpec } from '../../../actions/editor';
import { State } from '../../../constants/default-state';
import CompiledSpecDisplayHeader from '../compiled-spec-header';

interface Props {
  value;
}

class CompiledSpecDisplay extends React.Component<Props> {
  public render() {
    return (
      <div className={'sizeFixEditorParent full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        <MonacoEditor
          options={{
            automaticLayout: true,
            folding: true,
            readOnly: true,
            scrollBeyondLastLine: true,
            wordWrap: 'on',
          }}
          language="json"
          key={JSON.stringify(this.state)}
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

const mapDispatchToProps = dispatch => {
  return {
    showCompiledVegaSpec: () => {
      dispatch(showCompiledVegaSpec());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompiledSpecDisplay);
