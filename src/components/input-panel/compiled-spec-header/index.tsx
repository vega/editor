import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {State} from '../../../constants/default-state';

const toggleStyle = {
  cursor: 'pointer',
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & RouteComponentProps;

class CompiledSpecDisplayHeader extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.editVegaSpec = this.editVegaSpec.bind(this);
  }

  public editVegaSpec() {
    if (this.props.history.location.pathname.indexOf('/edited') === -1) {
      this.props.history.push('/edited');
    }
    this.props.clearConfig();
    this.props.updateVegaSpec(stringify(this.props.value));
  }
  public render() {
    if (this.props.compiledVegaSpec) {
      const toggleStyleUp = Object.assign({}, toggleStyle, {
        position: 'static',
      });
      return (
        <div className="editor-header" style={toggleStyleUp} onClick={this.props.toggleCompiledVegaSpec}>
          <span>Compiled Vega</span>
          <button onClick={this.editVegaSpec} style={{cursor: 'pointer'}}>
            Edit Vega Spec
          </button>

          <ChevronDown />
        </div>
      );
    } else {
      return (
        <div onClick={this.props.toggleCompiledVegaSpec} className="editor-header" style={toggleStyle}>
          <span>Compiled Vega</span>
          <ChevronUp />
        </div>
      );
    }
  }
}

function mapStateToProps(state: State) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    value: state.vegaSpec,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplayHeader));
