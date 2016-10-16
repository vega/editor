import React from 'react';

import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  render () {
    return (
      <div>
        <AceEditor
          mode='json'
          theme='github'
          width={'100%'}
          onChange={this.props.onChange}
          height={window.innerHeight-30 + 'px'}
          value={this.props.value}
          />
      </div>
    );
  };
};
