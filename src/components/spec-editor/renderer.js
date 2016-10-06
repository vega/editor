import React from 'react';

import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';

export default class Editor extends React.Component {
  render () {
    return (
      <div>
        <AceEditor
          mode='json'
          theme='github'
          width={'100%'}
          height={window.innerHeight + 'px'}
          value={this.props.vegaSpec}
          />
      </div>
    );
  };
};
