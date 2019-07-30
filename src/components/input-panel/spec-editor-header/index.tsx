import stringify from 'json-stringify-pretty-compact';
import * as React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../../actions/editor';
import { Mode, SIDEPANE } from '../../../constants';
import ConfigEditorHeader from '../../config-editor/config-editor-header';

const toggleStyle = {
  cursor: 'pointer',
};

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & { history: any };

class SpecEditorHeader extends React.PureComponent<Props> {
  public render() {
    const toggleStyleUp = Object.assign({}, toggleStyle, {
      position: 'static',
    });
    return (
      <div className="editor-header pane-header" onClick={e => this.props.toggleCompiledVegaSpec()}>
        <ul className="tabs-nav">
          <li
            className={this.props.sidePaneItem === SIDEPANE.Editor ? 'active-tab' : undefined}
            onClick={e => {
              if (this.props.sidePaneItem === SIDEPANE.Editor) {
                e.stopPropagation();
              }
              e.stopPropagation();
              this.props.setSidePaneItem(SIDEPANE.Editor);
            }}
          >
            {this.props.mode}
          </li>

          <li
            className={this.props.sidePaneItem === SIDEPANE.Config ? 'active-tab' : undefined}
            onClick={e => {
              if (this.props.sidePaneItem === SIDEPANE.Config) {
                e.stopPropagation();
              }
              e.stopPropagation();
              this.props.setSidePaneItem(SIDEPANE.Config);
            }}
          >
            Config
          </li>
        </ul>

        {this.props.sidePaneItem === SIDEPANE.Config && <ConfigEditorHeader />}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    value: state.vegaSpec,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      setSidePaneItem: EditorActions.setSidePaneItem,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SpecEditorHeader)
);
