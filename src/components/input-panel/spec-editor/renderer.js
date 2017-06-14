import React from 'react';
import { MODES } from '../../../constants';
import MonacoEditor from 'react-monaco-editor';
import { hashHistory } from 'react-router';

// import 'brace/mode/json';
// import 'brace/theme/github';

import './index.css'

const vegaSchema = require('../../../../schema/vega.schema.json');
const vegaLiteSchema = require('../../../../schema/vl.schema.json');

const schemas = {
  [MODES.Vega]: {
    uri: 'https://vega.github.io/schema/vega/v3.0.json',
    schema: vegaSchema,
    fileMatch: ['*']
  }, [MODES.VegaLite]: {
    uri: 'https://vega.github.io/schema/vega-lite/v2.json',
    schema: vegaLiteSchema,
    fileMatch: ['*']
  }
};

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  handleEditorChange (spec) {
    if (this.props.mode === MODES.Vega) {
      this.props.updateVegaSpec(spec);
    } else if (this.props.mode === MODES.VegaLite) {
      this.props.updateVegaLiteSpec(spec);
    }
    if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
      hashHistory.push('/edited');
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
      <MonacoEditor
        language='json'
        key={JSON.stringify(Object.assign({}, this.state, {mode: this.props.mode, selectedExample: this.props.selectedExample,
          gist: this.props.gist}))}
        options={{
          folding: true,
          scrollBeyondLastLine: false,
          wordWrap: true,
          wrappingIndent: "same",
          automaticLayout: true
        }}
        defaultValue={this.props.value}
        onChange={this.handleEditorChange.bind(this)}
        editorWillMount={this.editorWillMount.bind(this)}
      />
    );
  };
};
