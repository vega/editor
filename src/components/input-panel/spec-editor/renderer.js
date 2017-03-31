import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { MODES, LAYOUT } from '../../../constants';
import MonacoEditor from 'react-monaco-editor';

// import 'brace/mode/json';
// import 'brace/theme/github';

import './index.css'

const vegaSchema = require('../../../../schema/vega.schema.json');
const vegaLiteSchema = require('../../../../schema/vl.schema.json');

const schemas = {
  [MODES.Vega]: {
    schema: vegaSchema,
    fileMatch: ['*']
  }, [MODES.VegaLite]: {
    schema: vegaLiteSchema,
    fileMatch: ['*']
  }
};

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  state = {
    height: window.innerHeight - LAYOUT.HeaderHeight,
    width: '100%'
  }

  setHeight (width, height) {
    if (!height) {
      return;
    }
    this.setState({height});
  }

  setWidth (width, height) {
    if (!width) {
      return;
    }
    this.setState({width});
  }

  handleEditorChange (spec) {
    if (this.props.mode === MODES.Vega) {
      this.props.updateVegaSpec(spec);
    } else if (this.props.mode === MODES.VegaLite) {
      this.props.updateVegaLiteSpec(spec);
    }
  }

  editorWillMount (monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [schemas[this.props.mode]]
    });
  }

  render () {
    return (
      <div style={{width: '100%'}}> 
          <MonacoEditor
            width={'100%'}
            height={this.state.height}
            language='json'
            key={JSON.stringify(Object.assign({}, this.state, {mode: this.props.mode, selectedExample: this.props.selectedExample,
              gist: this.props.gist}))}
            
            defaultValue={this.props.value}
            onChange={this.handleEditorChange.bind(this)}
            editorWillMount={this.editorWillMount.bind(this)}
          />
           <ReactResizeDetector handleHeight onResize={this.setHeight.bind(this)} />
           <ReactResizeDetector handleWidth onResize={this.setWidth.bind(this)} />      
      </div> 
    );
  };
};
