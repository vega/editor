import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { ChevronDown, ChevronUp, Edit3 } from 'react-feather';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as EditorActions from '../../../actions/editor';

const toggleStyle = {
  cursor: 'pointer',
};

interface Props {
  value;
  compiledVegaSpec;
  history;

  showCompiledVegaSpec: () => void;
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
          <span>Compiled Vega</span>
          <ChevronDown />
          <button className="custom-btn edit-vega-btn" onClick={this.editVegaSpec}>
            <Edit3 size={12} />
            <span>{'Edit'}</span>
          </button>
        </div>
      );
    } else {
      return (
        <div onClick={this.props.showCompiledVegaSpec} className="editor-header" style={toggleStyle}>
          <span>Compiled Vega</span>
          <ChevronUp />
          <button onClick={this.editVegaSpec} style={{ zIndex: -1, opacity: 0, cursor: 'pointer' }}>
            Edit Vega Spec
          </button>
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
