import {range} from 'd3-array';
import {scaleBand} from 'd3-scale';
import React from 'react';

export default class TimelineRow extends React.PureComponent<{
  data: any[];
  width: number;
  xCount: number;
  onHoverInit: (hoverValue: any) => void;
  onHoverEnd: () => void;
  onClickInit: (hoverValue: any) => void;
  isTimelineSelected: boolean;
  clickedValue: any;
}> {
  public render() {
    const {data, width, xCount, clickedValue} = this.props;
    const scaleNew = scaleBand as any;
    const scale = scaleNew(range(0, xCount), [0, width]);

    const row =
      data &&
      data.map((d) => {
        return (
          <rect
            key={d.xCount}
            onMouseOver={() => this.props.onHoverInit(d)}
            onClick={() => this.props.onClickInit(d)}
            onMouseLeave={() => this.props.onHoverEnd()}
            className="svg-rect"
            height={31}
            style={{
              cursor: 'pointer',
              fill: clickedValue === d.xCount ? '#A4F9C8' : '#b7b7b7',
              pointerEvents: 'all',
              stroke: 'white',
              strokeWidth: '0.5px',
            }}
            width={scale.bandwidth()}
            x={scale(d.xCount)}
          ></rect>
        );
      });

    return (
      <svg style={{width: window.innerWidth * 0.3, height: 31}} width={window.innerWidth * 0.3} height={31}>
        {row}
      </svg>
    );
  }
}
