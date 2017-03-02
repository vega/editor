import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { LAYOUT } from '../../../constants';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import * as EditorActions from '../../../actions/editor';
import CompiledSpecDisplayHeader from '../compiled-spec-header'

class CompiledSpecDisplay extends React.Component {
  state = {
    height: (window.innerHeight - LAYOUT.HeaderHeight)/2,
    width: '100%'
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  setWidth (width, height) {
    if (!width) {
      return;
    }
    this.setState({width});
  }

  

  render () {
    return (
      <div
        style={{height: '100%'}}
      >
      <CompiledSpecDisplayHeader />
      <MonacoEditor
        options={{readOnly:true}}
        language='json'
        width={'100%'}
        key={JSON.stringify(this.state)}
        value={JSON.stringify(this.props.value, null, 2)}
      />
      <ReactResizeDetector handleHeight onResize={this.setHeight.bind(this)} />
      <ReactResizeDetector handleWidth onResize={this.setWidth.bind(this)} />

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
