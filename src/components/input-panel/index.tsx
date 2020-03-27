import * as React from 'react';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor';
import {LAYOUT, Mode, SIDEPANE} from '../../constants';
import {State} from '../../constants/default-state';
import ConfigEditor from '../config-editor';
import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './compiled-spec-header';
import SpecEditor from './spec-editor';
import SpecEditorHeader from './spec-editor-header';
import './index.css';

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

  public componentDidUpdate(prevProps, prevState) {
    if (this.props.mode === Mode.VegaLite) {
      if (this.props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
        this.props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.3);
      }
    }
  }

  public getInnerPanes() {
    return [
      <div key="editor" className="full-height-wrapper">
        <SpecEditorHeader key="specEditorHeader" />
        <div
          style={{
            height: 'calc(100% - 30px)', // - header
            display: this.props.sidePaneItem === SIDEPANE.Editor ? '' : 'none',
          }}
        >
          <SpecEditor key="editor" />
        </div>
        <div
          style={{
            height: 'calc(100% - 30px)', // - header
            display: this.props.sidePaneItem === SIDEPANE.Config ? '' : 'none',
          }}
        >
          <ConfigEditor key="configEditor" />
        </div>
      </div>,
      this.props.compiledVegaSpec ? (
        <CompiledSpecDisplay key="compiled" />
      ) : (
        <CompiledSpecHeader key="compiledSpecHeader" />
      ),
    ];
  }
  public render() {
    const innerPanes = this.getInnerPanes();

    return (
      // ! Never make this conditional based on modes
      // ! we will loose support for undo across modes
      // ! because the editor will be unmounted
      <div role="group" aria-label="spec editors">
        <SplitPane
          split="horizontal"
          primary="second"
          className="editor-spitPane"
          minSize={LAYOUT.MinPaneSize}
          defaultSize={this.props.compiledVegaSpec ? this.props.compiledVegaPaneSize : LAYOUT.MinPaneSize}
          onChange={this.handleChange}
          pane1Style={{minHeight: `${LAYOUT.MinPaneSize}px`}}
          pane2Style={{
            display: this.props.mode === Mode.Vega ? 'none' : 'block',
            height: this.props.compiledVegaSpec
              ? (this.props.compiledVegaPaneSize || window.innerHeight * 0.4) + 'px'
              : LAYOUT.MinPaneSize + 'px',
          }}
          onDragFinished={() => {
            if (this.props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
              this.props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.5);
              // Popping up the the compiled vega pane for the first time will set its
              // height to 50% of the split pane. This can change depending on the UI.
            }
          }}
        >
          {innerPanes}
        </SplitPane>
      </div>
    );
  }
}

function mapStateToProps(state: State) {
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

export default connect(mapStateToProps, mapDispatchToProps)(InputPanel);
