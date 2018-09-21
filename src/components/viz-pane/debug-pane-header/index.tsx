import * as React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as EditorActions from '../../../actions/editor';

interface Props {
  debugPane?: boolean;
  logs?: boolean;

  showLogs: (val: any) => void;
  toggleDebugPane: () => void;
}

class DebugPaneHeader extends React.Component<Props> {
  public render() {
    return (
      <div className="debug-pane-header" onClick={e => this.props.toggleDebugPane()}>
        <ul className="tabs-nav">
          <li
            className={this.props.logs ? 'active-tab' : ''}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(true);
            }}
          >
            Logs
          </li>
          <li
            className={this.props.logs ? '' : 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(false);
            }}
          >
            Data Viewer
          </li>
        </ul>
        {this.props.debugPane ? <ChevronDown /> : <ChevronUp />}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    debugPane: state.debugPane,
    logs: state.logs,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    showLogs: val => {
      dispatch(EditorActions.showLogs(val));
    },
    toggleDebugPane: () => {
      dispatch(EditorActions.toggleDebugPane());
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DebugPaneHeader)
);
