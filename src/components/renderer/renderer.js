/* global vg */

import React from 'react';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.string
  }

  renderVega () {
    let vegaSpecObject;
    try {
      vegaSpecObject = JSON.parse(this.props.vegaSpec);
    } catch (e) {
      return;
    }

    vg.parse.spec(vegaSpecObject, (chart) => {
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
