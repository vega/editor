import * as stringify from 'json-stringify-pretty-compact';
import {connect} from 'react-redux';

import * as React from 'react';
import * as EditorActions from '../../../actions/editor';

const toggleStyle = {
  cursor: 'pointer',
};
const svgStyle = {
  position: 'absolute' as 'absolute', // $FixMe
  right: '50%',
  height: 25,
  width: 35,
};

type Props = {
  value;
  compiledVegaSpec;
  showCompiledVegaSpec; // $FixMe - function
  updateVegaSpec: Function;
};

class CompiledSpecDisplayHeader extends React.Component<Props> {
  public editVegaSpec() {
    this.props.updateVegaSpec(stringify(this.props.value));
  }
  public render() {
    if (this.props.compiledVegaSpec) {
      const toggleStyleUp = Object.assign({}, toggleStyle, {
        position: 'static',
      });
      return (
        <div
          className='editor-header'
          style={toggleStyleUp}
          onClick={this.props.showCompiledVegaSpec}
        >
          <span style={{marginLeft: 10}}>Compiled Vega</span>
          <svg style={svgStyle}>
            <polygon points='5,5 30,5 17.5,20' />
          </svg>
          <button
            onClick={this.editVegaSpec.bind(this)}
            className='button'
            style={{float: 'right'}}
          >
            Edit Vega spec
          </button>
        </div>
      );
    } else {
      return (
        <div
          onClick={this.props.showCompiledVegaSpec}
          className='editor-header'
          style={toggleStyle}
        >
          <span style={{marginLeft: 10}}>Compiled Vega</span>
          <svg style={svgStyle}>
            <polygon points='5,20 30,20 17.5,5' />
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
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  CompiledSpecDisplayHeader,
);
