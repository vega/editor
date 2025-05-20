import * as React from 'react';
import {connect} from 'react-redux';
import {useNavigate} from 'react-router';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor.js';
import {SIDEPANE} from '../../../constants/index.js';
import {State} from '../../../constants/default-state.js';
import ConfigEditorHeader from '../../config-editor/config-editor-header.js';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    navigate: (path: string) => void;
  };

class SpecEditorHeader extends React.PureComponent<Props> {
  public render() {
    return (
      <div className="editor-header spec-editor-header">
        <ul className="tabs-nav">
          <li
            className={this.props.sidePaneItem === SIDEPANE.Editor ? 'active-tab' : undefined}
            onClick={(e) => {
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
            onClick={(e) => {
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

function mapStateToProps(state: State) {
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
      setSidePaneItem: EditorActions.setSidePaneItem,
    },
    dispatch,
  );
}

// Create a wrapper component to provide the navigation hook
const SpecEditorHeaderWithNavigation = (props: Omit<Props, 'navigate'>) => {
  const navigate = useNavigate();
  return <SpecEditorHeader {...props} navigate={navigate} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(SpecEditorHeaderWithNavigation);
