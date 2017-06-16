import React from 'react';
import { MODES } from '../../../constants';
import MonacoEditor from 'react-monaco-editor';
import { hashHistory } from 'react-router';

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

function debounce(func, wait, immediate) {
	let timeout;
	return function() {
		const context = this, args = arguments;
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  handleEditorChange (spec) {
    if(this.props.autoParse) {
      if (this.props.mode === MODES.Vega) {
        this.props.updateVegaSpec(spec);
      } else if (this.props.mode === MODES.VegaLite) {
        this.props.updateVegaLiteSpec(spec);
      }
    }
    this.spec = spec;
    if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
      hashHistory.push(`${this.props.mode}/edited`);
    }
  }

  editorWillMount (monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [schemas[this.props.mode]]
    });
  }

  componentWillReceiveProps(nextProps) {

    if(nextProps.parse) {
      if (this.props.mode === MODES.Vega) {
        this.props.updateVegaSpec(this.spec);
      } else if (this.props.mode === MODES.VegaLite) {
        this.props.updateVegaLiteSpec(this.spec);
      }
      this.props.parseSpec(false);
    }
  }

   manualParseSpec() {
    if(!this.props.autoParse) {
      return (
        <button id='parse-button' onClick={this.props.parseSpec}>Parse</button>
      )
    } else {
      return null;
    }
  }

  render () {
    return (
      <div style={{height: '100%', width: '100%'}}>
        {this.manualParseSpec()}
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
          onChange={debounce(this.handleEditorChange, 500).bind(this)}
          editorWillMount={this.editorWillMount.bind(this)}
        />
      </div>
    );
  };
};
