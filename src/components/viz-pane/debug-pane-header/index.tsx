import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {NAVBAR} from '../../../constants/consts';

interface Props {
  debugPane?: boolean;
  error?: string;
  logs?: boolean;
  warningsLogger: any[];
  warningsCount: number;
  navItem: string;

  showLogs: (val: any) => void;
  toggleDebugPane: () => void;
  toggleNavbar: (val: string) => void;
}

class DebugPaneHeader extends React.PureComponent<Props> {
  public componentDidMount() {
    if (this.props.logs || this.props.navItem === NAVBAR.Logs) {
      this.props.showLogs(true);
    }
  }
  public render() {
    return (
      <div className="pane-header" onClick={e => this.props.toggleDebugPane()}>
        <ul className="tabs-nav">
          <li
            className={
              this.props.error || (this.props.logs && this.props.navItem === NAVBAR.Logs) ? 'active-tab' : undefined
            }
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(true);
              this.props.toggleNavbar(NAVBAR.Logs);
            }}
          >
            <span className="logs-text">Logs</span>
            {this.props.error ? (
              <span className="error">(Error)</span>
            ) : this.props.warningsCount > 0 ? (
              <span className="warnings-count">({this.props.warningsCount})</span>
            ) : (
              ''
            )}
          </li>
          {this.props.error === null && (
            <li
              className={this.props.navItem === NAVBAR.DataViewer ? 'active-tab' : undefined}
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
          )}
          {this.props.error === null && (
            <li
              className={this.props.navItem === NAVBAR.SignalViewer ? 'active-tab' : undefined}
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
          )}
        </ul>
        {this.props.debugPane ? <ChevronDown /> : <ChevronUp />}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    debugPane: state.debugPane,
    error: state.error,
    logs: state.logs,
    navItem: state.navItem,
    warningsCount: state.warningsCount,
    warningsLogger: state.warningsLogger,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      showLogs: EditorActions.showLogs,
      toggleDebugPane: EditorActions.toggleDebugPane,
      toggleNavbar: EditorActions.toggleNavbar,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DebugPaneHeader)
);
