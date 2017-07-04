import React from 'react';
import SpecEditor from './spec-editor';
import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './compiled-spec-header';
import SplitPane from 'react-split-pane';
import {MODES, LAYOUT} from '../../constants';
import {connect} from 'react-redux';
import './index.css'

class InputPanel extends React.Component {
  getInnerPanes() {
    const {mode} = this.props;
    const innerPanes = [<SpecEditor key='editor' />];
    if (mode === MODES.VegaLite) {
      if (this.props.compiledVegaSpec) {
        innerPanes.push(<CompiledSpecDisplay key='compiled'/>);
      } else {
        innerPanes.push(<CompiledSpecHeader key='compiledSpecHeader'/>)
      }
    }
    return innerPanes;
  }

  render() {
    const innerPanes = this.getInnerPanes();

    let outerComponent;
    if (this.props.mode === MODES.VegaLite && this.props.compiledVegaSpec) {
        outerComponent = React.createElement(SplitPane,
        {
          split: 'horizontal',
          defaultSize: (window.innerHeight - LAYOUT.HeaderHeight) / innerPanes.length,
          pane2Style: {display: 'flex'}
        },
        innerPanes);
    } else {
      outerComponent = <div className={'full-height-wrapper'}>
        {innerPanes}
      </div>
    }
    return outerComponent;
  }
}


function mapStateToProps(state, ownProps) {
  return {
    mode: state.mode,
    compiledVegaSpec: state.compiledVegaSpec
  };
}

export default connect(mapStateToProps)(InputPanel);
