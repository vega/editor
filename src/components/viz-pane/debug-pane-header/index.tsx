import * as React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as EditorActions from '../../../actions/editor';
import { NAVBAR } from '../../../constants/consts';

interface Props {
  debugPane?: boolean;
  logs?: boolean;
  warningsLogger: any[];
  warningsCount: number;
  navItem: string;

  showLogs: (val: any) => void;
  toggleDebugPane: () => void;
  toggleNavbar: (val: string) => void;
}

class DebugPaneHeader extends React.Component<Props> {
  public componentDidMount() {
    if (this.props.logs) {
      this.props.toggleNavbar(NAVBAR.Logs);
      this.props.showLogs(true);
    }
  }
  public render() {
    return (
      <div className="debug-pane-header" onClick={e => this.props.toggleDebugPane()}>
        <ul className="tabs-nav">
          <li
            className={this.props.navItem === NAVBAR.Logs && 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(true);
              this.props.toggleNavbar(NAVBAR.Logs);
            }}
          >
            Logs ({this.props.warningsCount})
          </li>
          <li
            className={this.props.navItem === NAVBAR.DataViewer && !this.props.logs && 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(false);
              this.props.toggleNavbar(NAVBAR.DataViewer);
            }}
          >
            Data Viewer
          </li>
          <li
            className={this.props.navItem === NAVBAR.SignalViewer && !this.props.logs && 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(false);
              this.props.toggleNavbar(NAVBAR.SignalViewer);
            }}
          >
            Signal Viewer
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
    navItem: state.navItem,
    warningsCount: state.warningsCount,
    warningsLogger: state.warningsLogger,
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
    toggleNavbar: val => {
      dispatch(EditorActions.toggleNavbar(val));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DebugPaneHeader)
);
