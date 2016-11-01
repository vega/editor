import React from 'react';
import Height from 'react-height';
import AceEditor from 'react-ace';
import ReactResizeDetector from 'react-resize-detector';

import 'brace/mode/json';
import 'brace/theme/github';

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  state = {
    height: 0
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  render () {
    return (
        <div style={{height: '100%', width: '100%'}}>
          <AceEditor
            mode='json'
            theme='github'
            key={JSON.stringify(this.state)}
            width={'100%'}
            onChange={this.props.onChange}
            height={this.state.height + 'px'}
            value={this.props.value}
            />

          <ReactResizeDetector handleHeight onResize={this.setHeight.bind(this)} />
        </div>
    );
  };
};
