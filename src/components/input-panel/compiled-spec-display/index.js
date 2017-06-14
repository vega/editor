import React from 'react';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import * as EditorActions from '../../../actions/editor';
import CompiledSpecDisplayHeader from '../compiled-spec-header'

class CompiledSpecDisplay extends React.Component {
  render () {
    return (
      <div
        style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column'}}
        className={'sizeFixEditorParent'}
      >
      <CompiledSpecDisplayHeader />
      <MonacoEditor
        options={{
          readOnly:true,
          folding: true,
          scrollBeyondLastLine: false,
          wordWrap: true,
          automaticLayout: true
        }}
        language='json'
        key={JSON.stringify(this.state)}
        value={JSON.stringify(this.props.value, null, 2)}
      />
    </div>
    )
  };
};



function mapStateToProps (state, ownProps) {
  return {
    value: state.app.vegaSpec,
    compiledVegaSpec: state.app.compiledVegaSpec
  };
}

const mapDispatchToProps = function (dispatch) {
    return {
      showCompiledVegaSpec: () => {
        dispatch(EditorActions.showCompiledVegaSpec());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplay);
