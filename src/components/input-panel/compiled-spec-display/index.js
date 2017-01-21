import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { MODES, LAYOUT } from '../../../constants';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';

// import 'brace/mode/json';
// import 'brace/theme/github';

  const toggleStyle = {
    position: 'absolute',
    bottom: '0px',
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: '15px',
    width: '100%',
    height: '20px',
    backgroundColor: 'grey',
  };

class CompiledSpecDisplay extends React.Component {
  state = {
    height: (window.innerHeight - LAYOUT.HeaderHeight)/2,
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
  }
      
  render () {
    if (this.state.showCompiledSpec) {
      let toggleStyleUp = Object.assign({}, toggleStyle, {
        position: 'absolute',
        bottom: this.state.height + 'px'
      });
      return (
        <div style={{width: '100%', position: 'absolute', bottom: '0px'}}>
          <div
            style={toggleStyleUp}
            onClick={this.handleClick.bind(this)}>Read only, click to hide spec </div>
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
        <div style={{width: '100%'}}>
          <div  style={toggleStyle} onClick={this.handleClick.bind(this)}>
          Read only, click to show spec
          </div>
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
