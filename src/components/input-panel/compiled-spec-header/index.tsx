import stringify from 'json-stringify-pretty-compact';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as React from 'react';
import * as EditorActions from '../../../actions/editor';

const toggleStyle = {
  cursor: 'pointer',
};
const svgStyle = {
  height: 25,
  position: 'absolute' as 'absolute', // $FixMe
  right: '50%',
  width: 35,
};

interface Props {
  value;
  compiledVegaSpec;
  showCompiledVegaSpec; // $FixMe - function
  history;
  updateVegaSpec: (value: any) => void;
}

class CompiledSpecDisplayHeader extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.editVegaSpec = this.editVegaSpec.bind(this);
  }
  public editVegaSpec() {
    if (this.props.history.location.pathname.indexOf('/edited') === -1) {
      this.props.history.push('/edited');
    }
    this.props.updateVegaSpec(stringify(this.props.value));
  }
  public render() {
    if (this.props.compiledVegaSpec) {
      const toggleStyleUp = Object.assign({}, toggleStyle, {
        position: 'static',
      });
      return (
        <div className="editor-header" style={toggleStyleUp} onClick={this.props.showCompiledVegaSpec}>
          <span style={{ marginLeft: 10 }}>Compiled Vega</span>
          <svg style={svgStyle}>
            <polygon points="5,5 30,5 17.5,20" />
          </svg>
          <button onClick={this.editVegaSpec} style={{ position: 'absolute', right: '3%', cursor: 'pointer' }}>
            Edit Vega spec
          </button>
        </div>
      );
    } else {
      return (
        <div onClick={this.props.showCompiledVegaSpec} className="editor-header" style={toggleStyle}>
          <span style={{ marginLeft: 10 }}>Compiled Vega</span>
          <svg style={svgStyle}>
            <polygon points="5,20 30,20 17.5,5" />
          </svg>
        </div>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
    value: state.vegaSpec,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    showCompiledVegaSpec: () => {
      dispatch(EditorActions.showCompiledVegaSpec());
    },
    updateVegaSpec: val => {
      dispatch(EditorActions.updateVegaSpec(val));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CompiledSpecDisplayHeader)
);
