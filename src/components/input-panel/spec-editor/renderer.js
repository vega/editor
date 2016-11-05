import React from 'react';
import AceEditor from 'react-ace';
import ReactResizeDetector from 'react-resize-detector';
import { MODES, LAYOUT } from '../../../constants';

import 'brace/mode/json';
import 'brace/theme/github';

import './index.css'

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  state = {
    height: window.innerHeight - LAYOUT.HeaderHeight
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  handleEditorChange (spec) {
    // console.log('onChange');
    // console.log(spec)
    if (this.props.mode === MODES.Vega) {
      this.props.updateVegaSpec(spec);
    } else if (this.props.mode === MODES.VegaLite) {
      this.props.updateVegaLiteSpec(spec);
    }
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
            onChange={this.handleEditorChange.bind(this)}
            height={this.state.height + 'px'}
            value={this.props.value}
            />

          <ReactResizeDetector handleHeight onResize={this.setHeight.bind(this)} />
        </div>
    );
  };
};
