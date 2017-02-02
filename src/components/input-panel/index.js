import React from 'react';
import SpecEditor from './spec-editor';
import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './complied-spec-header';
import Debug from './debug';
import SplitPane from 'react-split-pane';
import { MODES, LAYOUT } from '../../constants';
import { connect } from 'react-redux';
import './index.css'

const height = () => {
  return (window.innerHeight - LAYOUT.HeaderHeight)/2;
};

class InputPanel extends React.Component {
  getInnerPanes () {
    const { mode, debug } = this.props;
    const innerPanes = [<SpecEditor key='editor' />];
    if (mode === MODES.VegaLite) {
      if (this.props.compiledVegaSpec) {
        innerPanes.push(<CompiledSpecDisplay style={{height:'100%'}} key='compiled'/>);
      } else {
        innerPanes.push(<CompiledSpecHeader key='compiledSpecHeader'/>)
      }
    }
    if (debug) {
      innerPanes.push(<Debug key='debug' />);
    }
    return innerPanes;
  }

  render () {
    const innerPanes = this.getInnerPanes();
    
    let outerComponent;
    if ((this.props.mode == MODES.VegaLite && this.props.compiledVegaSpec) || this.props.debug) {
        outerComponent = React.createElement(SplitPane, 
        {
          split: 'horizontal',
          defaultSize: 250
        }, 
        innerPanes);
    } else {
      outerComponent = React.createElement('div', {style: {width: '100%'}}, innerPanes);
    }
    return outerComponent;
  };
};
 

function mapStateToProps (state, ownProps) {
  return {
    mode: state.app.mode,
    debug: state.app.debug,
    compiledVegaSpec: state.app.compiledVegaSpec 
  };
}

export default connect(mapStateToProps)(InputPanel);
