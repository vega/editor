import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {COMPILEDPANE} from '../../../constants';
import {State} from '../../../constants/default-state';

const toggleStyle = {
  cursor: 'pointer',
} as const;

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
    if (this.props.compiledPaneItem == COMPILEDPANE.Vega) {
      this.props.updateVegaSpec(stringify(this.props.value));
    } else {
      this.props.updateVegaLiteSpec(stringify(this.props.value));
    }
  }
  public render() {
    if (this.props.compiledVegaSpec) {
      const toggleStyleUp = {...toggleStyle, position: 'static'} as const;
      return (
        <div className="editor-header" style={toggleStyleUp} onClick={this.props.toggleCompiledVegaSpec}>
          <ul className="tabs-nav">
            <li
              className={this.props.compiledPaneItem == COMPILEDPANE.Vega ? 'active-tab' : undefined}
              onClick={(e) => {
                this.props.setCompiledPaneItem(COMPILEDPANE.Vega);
                e.stopPropagation();
              }}
            >
              Compiled Vega
            </li>

            <li
              className={this.props.compiledPaneItem == COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
              onClick={(e) => {
                this.props.setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
                e.stopPropagation();
              }}
            >
              Extended Vega-Lite Spec
            </li>
          </ul>
          {this.props.compiledPaneItem === COMPILEDPANE.Vega ? (
            <button onClick={this.editVegaSpec} style={{cursor: 'pointer'}}>
              Edit Vega Spec
            </button>
          ) : null}
          {this.props.compiledPaneItem === COMPILEDPANE.NormalizedVegaLite ? (
            <button onClick={this.editVegaSpec} style={{cursor: 'pointer'}}>
              Edit Extended Vega-Lite Spec
            </button>
          ) : null}
          <ChevronDown />
        </div>
      );
    } else {
      return (
        <div onClick={this.props.toggleCompiledVegaSpec} className="editor-header" style={toggleStyle}>
          <ul className="tabs-nav">
            <li
              className={this.props.compiledPaneItem == COMPILEDPANE.Vega ? 'active-tab' : undefined}
              onClick={(e) => {
                this.props.setCompiledPaneItem(COMPILEDPANE.Vega);
              }}
            >
              Compiled Vega
            </li>
            <li
              className={this.props.compiledPaneItem == COMPILEDPANE.NormalizedVegaLite ? 'active-tab' : undefined}
              onClick={(e) => {
                this.props.setCompiledPaneItem(COMPILEDPANE.NormalizedVegaLite);
              }}
            >
              Extended Vega-Lite Spec
            </li>
          </ul>
          <ChevronUp />
        </div>
      );
    }
  }
}

function mapStateToProps(state: State) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    value: state.compiledPaneItem == COMPILEDPANE.Vega ? state.vegaSpec : state.normalizedVegaLiteSpec,
    compiledPaneItem: state.compiledPaneItem,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      setCompiledPaneItem: EditorActions.setCompiledPaneItem,
    },
    dispatch
  );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CompiledSpecDisplayHeader));
