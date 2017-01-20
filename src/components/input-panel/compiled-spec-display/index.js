import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { MODES, LAYOUT } from '../../../constants';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import './index.css'

// import 'brace/mode/json';
// import 'brace/theme/github';

class CompiledSpecDisplay extends React.Component {
  state = {
    // height: window.innerHeight - LAYOUT.HeaderHeight,
    height: 300,
    showCompiledSpec: false
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  handleClick () {
    this.setState(preState => ({
      showCompiledSpec: !preState.showCompiledSpec
    }));
    console.log(this.props);
  }
      
  render () {
    if (this.state.showCompiledSpec) {
      return (
        <div style={{width: '100%'}} className='compiledSpecDisplay'>
          <span onClick={this.handleClick.bind(this)}>Read only, click to hide spec </span>
          <MonacoEditor
            mode='json'
            theme='github'
            showGutter={true}
            key={JSON.stringify(this.state)}
            width={'100%'}
            height={this.state.height}
            // value={JSON.stringify(this.props.value)}
            value='Show compiled vega spec'
            />
      </div>)
    } else {
      return (
        <div style={{width: '100%'}} className='compiledSpecDisplay'>
        <span onClick={this.handleClick.bind(this)}> Read only, click to show spec</span>
        </div>
      )
    }
  };
};



function mapStateToProps (state, ownProps) {
  return {
    value: state.app.vegaSpec,
  };
}

export default connect(mapStateToProps)(CompiledSpecDisplay);
