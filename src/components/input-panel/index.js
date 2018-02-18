import './index.css';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';

import {LAYOUT, MODES} from '../../constants';
import CompiledSpecDisplay from './compiled-spec-display';
import CompiledSpecHeader from './compiled-spec-header';
import SpecEditor from './spec-editor';

class InputPanel extends React.Component {
  static propTypes = {
    compiledVegaSpec: PropTypes.bool,
    mode: PropTypes.string
  }

  getInnerPanes() {
    const innerPanes = [<SpecEditor key='editor' />];
    if (this.props.mode === MODES.VegaLite) {
      if (this.props.compiledVegaSpec) {
        innerPanes.push(<CompiledSpecDisplay key='compiled' />);
      } else {
        innerPanes.push(<CompiledSpecHeader key='compiledSpecHeader' />)
      }
    }
    return innerPanes;
  }

  render() {
    const innerPanes = this.getInnerPanes();


    // In the else case, using the same SplitPane configuration as the if case causes the 'compiled vega' button
    // to get hidden on browser resize!
    if (this.props.mode === MODES.VegaLite && this.props.compiledVegaSpec) {
        return <SplitPane split="horizontal" defaultSize={(window.innerHeight - LAYOUT.HeaderHeight) / innerPanes.length} pane2Style={{display: 'flex'}}>
          {innerPanes}
        </SplitPane>;
    } else {
      if(this.props.mode === MODES.Vega){
        return <div className={'full-height-wrapper'}>
          {innerPanes}
        </div>
      } else {
        return <SplitPane split="horizontal" primary="second" defaultSize={25} pane1Style={{display: 'flex'}}>
          {innerPanes}
        </SplitPane>;
      }
    }
  }
}


function mapStateToProps(state, ownProps) {
  return {
    mode: state.mode,
    compiledVegaSpec: state.compiledVegaSpec
  };
}

export default connect(mapStateToProps)(InputPanel);
