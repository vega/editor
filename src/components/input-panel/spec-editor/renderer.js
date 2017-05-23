import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { MODES, LAYOUT } from '../../../constants';
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

  constructor(props) {
    super(props);

    const h = window.innerHeight - LAYOUT.HeaderHeight;
    this.state = {
      height: props.compiledVegaSpec ? h / 2 : h - 25,
      width: '100%'
    }
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
    if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
      hashHistory.push(hashHistory.getCurrentLocation().pathname + '/edited');
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
    if (nextProps.compiledVegaSpec !== this.props.compiledVegaSpec) {
      if (!nextProps.compiledVegaSpec) {
        this.setState({
          height: (window.innerHeight - LAYOUT.HeaderHeight) - 25,
        })
      } else {
        this.setState({
          height: (window.innerHeight - LAYOUT.HeaderHeight) / 2,
        })
      }
    }
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
            options={{
              folding: true,
              scrollBeyondLastLine: false,
              wordWrap: true,
              wrappingIndent: "same"
            }}
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
