import React, { Component } from 'react';
import * as d3 from 'd3-selection';
import { deepEqual } from 'vega-lite/src/util';
export default class TimelineRow extends Component<any, any> {
  public scg = null;

  renderChart() {
    const data = this.props.data;
    console.log(data.length);
    (this as any).svg = d3
      .select(`#timeline${this.props.id}`)
      .append('svg')
      .attr('width', 2000)
      .attr('height', 20);

    (this as any).svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => (i * 600) / data.length)
      .attr('y', 0)
      .attr('width', 600 / data.length)
      .attr('height', (d, i) => 20)
      .attr('fill', 'grey');
  }

  componentDidMount() {
    this.renderChart();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data.length !== nextProps.data.length) {
      let gi = 0;
      var circle = (this as any).svg
        .selectAll('rect')
        .data(nextProps.data)
        .attr('width', 600 / nextProps.data.length)
        .attr('x', (d, i) => {
          gi = i;
          return (600 * i) / nextProps.data.length;
        });

      circle.exit().remove(); // EXIT

      circle
        .enter()
        .append('rect') // ENTER; modifies UPDATE! 🌶
        .attr('x', (d, i) => {
          gi++;
          return (600 * gi) / nextProps.data.length;
        })
        .attr('y', 0)
        .attr('width', 600 / nextProps.data.length)
        .attr('height', (d, i) => 20)
        .attr('fill', 'grey');

      circle // ENTER + UPDATE
        .style('stroke', 'white');
    }
  }
  render() {
    return null;
  }
}
