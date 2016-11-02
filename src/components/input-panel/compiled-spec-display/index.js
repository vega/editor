import React from 'react';
import AceEditor from 'react-ace';
import ReactResizeDetector from 'react-resize-detector';
import { MODES, LAYOUT } from '../../../constants';
import { connect } from 'react-redux';

import 'brace/mode/json';
import 'brace/theme/github';

class CompiledSpecDisplay extends React.Component {
  state = {
    height: window.innerHeight - LAYOUT.HeaderHeight
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  render () {
    return (
        <div style={{width: '100%'}}>
          <AceEditor
            mode='json'
            theme='github'
            showGutter={true}
            key={JSON.stringify(this.state)}
            width={'100%'}
            height={this.state.height + 'px'}
            value={JSON.stringify(this.props.value)}
            />

          <ReactResizeDetector handleHeight onResize={this.setHeight.bind(this)} />
        </div>
    );
  };
};



function mapStateToProps (state, ownProps) {
  return {
    value: state.app.vegaSpec,
  };
}

export default connect(mapStateToProps)(CompiledSpecDisplay);
