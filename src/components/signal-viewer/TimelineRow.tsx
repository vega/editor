import { range } from 'd3-array';
import { scaleBand } from 'd3-scale';
import stringify from 'json-stringify-pretty-compact';
import React, { Component } from 'react';

export default class TimelineRow extends Component<{ data: any[]; width: number; xCount: number }, any> {
  public render() {
    const { data, width, xCount } = this.props;
    const scale = scaleBand(range(0, xCount), [0, width]);

    const row = data.map(d => {
      return (
        <rect
          className="svg-rect"
          height={20}
          style={{
            cursor: 'pointer',
            fill: '#b7b7b7',
            pointerEvents: 'all',
            stroke: 'white',
            strokeWidth: '0.5px',
          }}
          width={scale.bandwidth()}
          x={scale(d.xCount)}
        >
          {stringify(d)}
        </rect>
      );
    });

    return <svg>{row}</svg>;
  }
}
