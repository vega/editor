/* global vg, vl */

import React from 'react';
// import vl from 'vega-lite';
// import vg from 'vega';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.object
  }

  renderVega () {
    vg.parse.spec(this.props.vegaSpec, (chart) => {
      const vis = chart({ el: this.refs.chart });
      vis.update();
    });
  }

  componentDidMount () {
    this.renderVega();
    console.log(vl);
  }

  componentWillReceiveProps (nextProps) {
    this.renderVega();
  }

  render () {
    return (
      <div ref='chart'>
      </div>
    );
  };
};
