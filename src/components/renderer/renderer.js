/* global vg */

import React from 'react';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.object
  }

  componentDidMount () {

    vg.parse.spec(this.props.vegaSpec, (chart) => {
      var vis = chart({ el: this.refs.chart });
      vis.update();
    });

  }

  render () {
    return (
      <div ref='chart'>
      </div>
    );
  };
};
