import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor.js';
import {LAYOUT, Mode, SIDEPANE} from '../../constants/index.js';
import {State} from '../../constants/default-state.js';
import ConfigEditor from '../config-editor/index.js';
import CompiledSpecDisplay from './compiled-spec-display/index.js';
import CompiledSpecHeader from './compiled-spec-header/index.js';
import './index.css';
import '../split.css';
import SpecEditor from './spec-editor/index.js';
import SpecEditorHeader from './spec-editor-header/index.js';
import Split from 'react-split';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class InputPanel extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  public handleChange(sizes: number[]) {
    const size = sizes[1] * window.innerHeight;
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

    // Calculate the initial sizes based on compiledVegaSpec
    const initialSizes = this.props.compiledVegaSpec
      ? [70, 30] // If we have a compiled spec, show it with 30% of space
      : [100, 0]; // Otherwise, give full space to the editor

    return (
      // ! Never make this conditional based on modes
      // ! we will loose support for undo across modes
      // ! because the editor will be unmounted
      <div role="group" aria-label="spec editors" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <Split
          sizes={initialSizes}
          minSize={LAYOUT.MinPaneSize}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="vertical"
          cursor="row-resize"
          className="editor-splitPane"
          onDrag={this.handleChange}
          onDragEnd={() => {
            if (this.props.compiledVegaPaneSize === LAYOUT.MinPaneSize) {
              this.props.setCompiledVegaPaneSize((window.innerHeight - LAYOUT.HeaderHeight) * 0.5);
              // Popping up the the compiled vega pane for the first time will set its
              // height to 50% of the split pane. This can change depending on the UI.
            }
          }}
        >
          {innerPanes[0]}
          {innerPanes[1]}
        </Split>
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
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(InputPanel);
