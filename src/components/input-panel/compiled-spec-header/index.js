import React from 'react';
import {connect} from 'react-redux';
import * as EditorActions from '../../../actions/editor';

const toggleStyle = {
  cursor:'pointer'
};

const svgStyle = {
  position:'absolute',
  right:'50%',
  height: 25,
  width: 35
}

class CompiledSpecDisplayHeader extends React.Component {
  editVegaSpec() {
    this.props.updateVegaSpec(JSON.stringify(this.props.value, null, 2));
  }

  render() {
    if (this.props.compiledVegaSpec) {
      const toggleStyleUp = Object.assign({}, toggleStyle, {
        position: 'static'
      });
      return (
        <div className="editor-header"
             style={toggleStyleUp}
             onClick={this.props.showCompiledVegaSpec}>
            <span style={{marginLeft: 10}}>
              Compiled Vega
            </span>
          <svg
              style={svgStyle}>
              <polygon points="5,5 30,5 17.5,20" />
          </svg>
          <button
              onClick={this.editVegaSpec.bind(this)}
              style={{position:'absolute', right:'3%', cursor:'pointer'}}>
              Edit Vega spec
          </button>
        </div>
      );
    } else {
      return (
        <div onClick={this.props.showCompiledVegaSpec} className="editor-header" style={toggleStyle}>
          <span style={{marginLeft: 10}}>
            Compiled Vega
          </span>
          <svg
            style={svgStyle}>
            <polygon points="5,20 30,20 17.5,5" />
          </svg>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    value: state.vegaSpec,
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
  };
}

const mapDispatchToProps = function(dispatch) {
  return {
    updateVegaSpec: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    },
    showCompiledVegaSpec: () => {
      dispatch(EditorActions.showCompiledVegaSpec());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplayHeader);
