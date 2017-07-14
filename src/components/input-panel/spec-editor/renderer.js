import React from 'react';
import {MODES} from '../../../constants';
import MonacoEditor from 'react-monaco-editor';
import {hashHistory} from 'react-router';
import parser from 'vega-schema-url-parser';

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
}

export default class Editor extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  handleEditorChange(spec) {
    if (this.props.autoParse) {
      this.updateSpec(spec);
    } else {
      this.props.updateEditorString(spec);
    }
    if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
      hashHistory.push('/edited');
    }
  }

  editorWillMount(monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [schemas[this.props.mode]]
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.autoParse && nextProps.parse) {
      this.updateSpec(nextProps.value);
      this.props.parseSpec(false);
    }
  }

   manualParseSpec() {
    if (!this.props.autoParse) {
      return (
        <div className="editor-header"> 
          <button id='parse-button' onClick={() => this.props.parseSpec(true)}>Parse</button>
        </div>
      )
    } else {
      return null;
    }
  }

  updateSpec(spec) {
    let schema, parsedMode;
    try {
      schema = JSON.parse(spec).$schema;
    } catch (err) {
      console.warn('Error parsing json string');
    } 
    if (schema) {
      parsedMode = parser(schema).library;
    }  
    if (parsedMode === MODES.Vega || (!parsedMode && this.props.mode === MODES.Vega)) {
      this.props.updateVegaSpec(spec);
    } else if (parsedMode === MODES.VegaLite || (!parsedMode && this.props.mode === MODES.VegaLite)) {
      this.props.updateVegaLiteSpec(spec);
    }
  }
 
  render() {
    return (
      <div className={'full-height-wrapper'}>
        {this.manualParseSpec()}
        <MonacoEditor
          language='json'
          key={JSON.stringify(Object.assign({}, this.state, {mode: this.props.mode, selectedExample: this.props.selectedExample,
            gist: this.props.gist}))}
          options={{
            folding: true,
            scrollBeyondLastLine: true,
            wordWrap: true,
            wrappingIndent: 'same',
            automaticLayout: true,
            autoIndent: true,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 4
          }}
          defaultValue={this.props.value}
          onChange={debounce(this.handleEditorChange, 700).bind(this)}
          editorWillMount={this.editorWillMount.bind(this)}
        />
      </div>
    );
  }
}
