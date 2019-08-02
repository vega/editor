import * as React from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import { LAYOUT, Mode, SIDEPANE } from '../../constants';
import { State } from '../../constants/default-state';
import ConfigEditor from '../config-editor';
import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './compiled-spec-header';
import './index.css';
import SpecEditor from './spec-editor';
import SpecEditorHeader from './spec-editor-header';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class InputPanel extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  public handleChange(size: number) {
    this.props.setCompiledVegaPaneSize(size);
    if (
      (size > LAYOUT.MinPaneSize && !this.props.compiledVegaSpec) ||
      (size === LAYOUT.MinPaneSize && this.props.compiledVegaSpec)
    ) {
      this.props.toggleCompiledVegaSpec();
    }
  }
  public componentDidUpdate() {
    if (this.props.mode === Mode.VegaLite) {
      if (this.props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
        this.props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.3);
      }
    }
  }

  public componentDidMount() {
    if (this.props.mode === Mode.Vega) {
      const pane2 = (this.refs.compiledVegaPane as any).pane2;
      pane2.style.display = 'none';
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      const pane2 = (this.refs.compiledVegaPane as any).pane2;
      if (nextProps.mode === Mode.Vega) {
        pane2.style.display = 'none';
      } else {
        pane2.style.display = 'flex';
      }
    }
  }

  public getInnerPanes() {
    const innerPanes = [
      <div key="editor" className="full-height-wrapper">
        <SpecEditorHeader key="specEditorHeader" />

        <SpecEditor key="editor" />

        <ConfigEditor key="configEditor" />
      </div>,
    ];
    if (this.props.compiledVegaSpec) {
      innerPanes.push(<CompiledSpecDisplay key="compiled" />);
    } else {
      innerPanes.push(<CompiledSpecHeader key="compiledSpecHeader" />);
    }

    return innerPanes;
  }
  public render() {
    const innerPanes = this.getInnerPanes();
    const compiledVegaPane = this.refs.compiledVegaPane as any;
    if (compiledVegaPane) {
      compiledVegaPane.pane2.style.height = this.props.compiledVegaSpec
        ? (this.props.compiledVegaPaneSize || window.innerHeight * 0.4) + 'px'
        : LAYOUT.MinPaneSize + 'px';
    }

    return (
      // ! Never make this conditional based on modes
      // ! we will loose support for undo across modes
      // ! because the editor will be unmounted
      <SplitPane
        ref="compiledVegaPane"
        split="horizontal"
        primary="second"
        className="editor-spitPane"
        minSize={LAYOUT.MinPaneSize}
        defaultSize={this.props.compiledVegaSpec ? this.props.compiledVegaPaneSize : LAYOUT.MinPaneSize}
        onChange={this.handleChange}
        pane1Style={{ minHeight: `${LAYOUT.MinPaneSize}px` }}
        paneStyle={{ display: 'flex' }}
        onDragFinished={() => {
          if (this.props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
            this.props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.3);
            // Popping up the the compiled vega pane for the first time will set its
            // height to 30% of the split pane. This can change depending on the UI.
          }
        }}
      >
        {innerPanes}
      </SplitPane>
    );
  }
}

function mapStateToProps(state: State, ownProps) {
  return {
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setCompiledVegaPaneSize: EditorActions.setCompiledVegaPaneSize,
      toggleCompiledVegaSpec: EditorActions.toggleCompiledVegaSpec,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InputPanel);
