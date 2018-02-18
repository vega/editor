/** @format */

import SplitPane from 'react-split-pane';

import {connect} from 'react-redux';

import * as React from 'react';

import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './compiled-spec-header';
import SpecEditor from './spec-editor';

import {LAYOUT, MODES} from '../../constants';

import './index.css';

type Props = {
  compiledVegaSpec?: boolean;
  mode?: string;
};
class InputPanel extends React.Component<Props> {
  getInnerPanes() {
    const innerPanes = [<SpecEditor key="editor" />];
    if (this.props.mode === MODES.VegaLite) {
      if (this.props.compiledVegaSpec) {
        innerPanes.push(<CompiledSpecDisplay key="compiled" />);
      } else {
        innerPanes.push(<CompiledSpecHeader key="compiledSpecHeader" />);
      }
    }
    return innerPanes;
  }
  render() {
    const innerPanes = this.getInnerPanes();
    if (this.props.mode === MODES.VegaLite && this.props.compiledVegaSpec) {
      return (
        <SplitPane
          split="horizontal"
          defaultSize={
            (window.innerHeight - LAYOUT.HeaderHeight) / innerPanes.length
          }
          pane2Style={{display: 'flex'}}
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
    mode: state.mode,
    compiledVegaSpec: state.compiledVegaSpec,
  };
}
export default connect(mapStateToProps)(InputPanel);
