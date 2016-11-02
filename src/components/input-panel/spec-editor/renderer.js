import React from 'react';
import AceEditor from 'react-ace';
import ReactResizeDetector from 'react-resize-detector';
import { MODES } from '../../../constants';

import 'brace/mode/json';
import 'brace/theme/github';

import './index.css'

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  state = {
    height: window.innerHeight - 70
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  handleEditorChange (spec) {
    if (this.props.mode === MODES.Vega) {
      this.props.updateVegaSpec(spec);
    } else if (this.props.mode === MODES.VegaLite) {
      this.props.updateVegaLiteSpec(spec);
    }
  }

  render () {
    console.log(this.state.height);
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
