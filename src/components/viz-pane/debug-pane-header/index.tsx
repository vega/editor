import * as React from 'react';
import {ChevronDown, ChevronUp} from 'react-feather';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {NAVBAR} from '../../../constants/consts';
import {State} from '../../../constants/default-state';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class DebugPaneHeader extends React.PureComponent<Props> {
  public componentDidMount() {
    if (this.props.logs || this.props.navItem === NAVBAR.Logs) {
      this.props.showLogs(true);
    }
  }

  public render() {
    const {toggleDebugPane, debugPane, showLogs, error, logs, navItem, toggleNavbar, warns, errors} = this.props;

    return (
      <div className="pane-header" onClick={toggleDebugPane}>
        <ul className="tabs-nav">
          <li
            className={error || (logs && navItem === NAVBAR.Logs) ? 'active-tab' : undefined}
            onClick={(e) => {
              if (debugPane) {
                e.stopPropagation();
              }
              showLogs(true);
              toggleNavbar(NAVBAR.Logs);
            }}
          >
            <span className="logs-text">Logs</span>
            {error ? (
              <span className="error">(Error)</span>
            ) : errors.length > 0 ? (
              <span className="error">({errors.length})</span>
            ) : warns.length > 0 ? (
              <span className="warnings-count">({warns.length})</span>
            ) : (
              ''
            )}
          </li>
          {error === null && (
            <li
              className={navItem === NAVBAR.DataViewer ? 'active-tab' : undefined}
              onClick={(e) => {
                if (debugPane) {
                  e.stopPropagation();
                }
                showLogs(false);
                toggleNavbar(NAVBAR.DataViewer);
              }}
            >
              Data Viewer
            </li>
          )}
          {error === null && (
            <li
              className={navItem === NAVBAR.SignalViewer ? 'active-tab' : undefined}
              onClick={(e) => {
                if (debugPane) {
                  e.stopPropagation();
                }
                showLogs(false);
                toggleNavbar(NAVBAR.SignalViewer);
              }}
            >
              Signal Viewer
            </li>
          )}
        </ul>
        {debugPane ? <ChevronDown /> : <ChevronUp />}
      </div>
    );
  }
}

function mapStateToProps(state: State, ownProps) {
  return {
    debugPane: state.debugPane,
    error: state.error,
    errors: state.errors,
    logs: state.logs,
    navItem: state.navItem,
    warns: state.warns,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DebugPaneHeader));
