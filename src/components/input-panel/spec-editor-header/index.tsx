import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../../actions/editor';
import { SIDEPANE } from '../../../constants';
import ConfigEditorHeader from '../../config-editor/config-editor-header';
import './index.css';

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
      <div className="editor-header pane-header spec-editor-header">
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
    configEditorString: state.configEditorString,
    editorString: state.editorString,
    manualParse: state.manualParse,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    themeName: state.themeName,
    value: state.vegaSpec,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      parseSpec: EditorActions.parseSpec,
      setConfig: EditorActions.setConfig,
      setConfigEditorString: EditorActions.setConfigEditorString,
      setSidePaneItem: EditorActions.setSidePaneItem,
      setThemeName: EditorActions.setThemeName,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
      updateEditorString: EditorActions.updateEditorString,
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
