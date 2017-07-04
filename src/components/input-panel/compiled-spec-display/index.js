import React from 'react';
import {connect} from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import * as EditorActions from '../../../actions/editor';
import CompiledSpecDisplayHeader from '../compiled-spec-header'
const JSON3 = require('../../../../lib/json3-compactstringify');

class CompiledSpecDisplay extends React.Component {
  render() {
    return (
      <div className={'sizeFixEditorParent full-height-wrapper'}>
        <CompiledSpecDisplayHeader />
        <MonacoEditor
          options={{
            readOnly: true,
            folding: true,
            scrollBeyondLastLine: true,
            wordWrap: true,
            automaticLayout: true
          }}
          language='json'
          key={JSON.stringify(this.state)}
          value={JSON3.stringify(this.props.value, null, 2, 60)}
        />
      </div>
    )
  }
}



function mapStateToProps(state, ownProps) {
  return {
    value: state.vegaSpec,
    compiledVegaSpec: state.compiledVegaSpec
  };
}

const mapDispatchToProps = function(dispatch) {
    return {
      showCompiledVegaSpec: () => {
        dispatch(EditorActions.showCompiledVegaSpec());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplay);
