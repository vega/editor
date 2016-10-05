import React from 'react';
import { connect } from 'react-redux';
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';

class Editor extends React.Component {
  render () {
    return (
      <div>
        <AceEditor
            value={JSON.stringify(this.props.vegaSpec)}
          />
      </div>
    );
  };
};


function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.editor.vegaSpec
  };
}

export default connect(mapStateToProps)(Editor);
