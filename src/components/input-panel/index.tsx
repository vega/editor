import './index.css';

import * as React from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import * as EditorActions from '../../actions/editor';
import { LAYOUT, Mode } from '../../constants';
import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './compiled-spec-header';
import SpecEditor from './spec-editor';

interface Props {
  compiledVegaSpec?: boolean;
  compiledVegaPaneSize: number;
  mode?: Mode;

  setCompiledVegaPaneSize: (val: any) => void;
  toggleCompiledVegaSpec: () => void;
}

class InputPanel extends React.Component<Props> {
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
  public getInnerPanes() {
    const innerPanes = [<SpecEditor key="editor" />];
    if (this.props.mode === Mode.VegaLite) {
      if (this.props.compiledVegaSpec) {
        innerPanes.push(<CompiledSpecDisplay key="compiled" />);
      } else {
        innerPanes.push(<CompiledSpecHeader key="compiledSpecHeader" />);
      }
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

    if (this.props.mode === Mode.VegaLite) {
      return (
        <SplitPane
          ref="compiledVegaPane"
          split="horizontal"
          primary="second"
          minSize={LAYOUT.MinPaneSize}
          defaultSize={this.props.compiledVegaSpec ? this.props.compiledVegaPaneSize : LAYOUT.MinPaneSize}
          onChange={this.handleChange}
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
    } else {
      return <div className={'full-height-wrapper'}>{innerPanes}</div>;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    compiledVegaSpec: state.compiledVegaSpec,
    mode: state.mode,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    setCompiledVegaPaneSize: val => {
      dispatch(EditorActions.setCompiledVegaPaneSize(val));
    },
    toggleCompiledVegaSpec: () => {
      dispatch(EditorActions.toggleCompiledVegaSpec());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InputPanel);
