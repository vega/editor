/* global vg */

import React from 'react';

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
  }

  render () {
    return (
      <div ref='chart'>
      </div>
    );
  };
};
