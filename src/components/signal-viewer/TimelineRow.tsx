import {range} from 'd3-array';
import {scaleBand} from 'd3-scale';
import React from 'react';

interface TimelineRowProps {
  data: any[];
  width: number;
  xCount: number;
  onHoverInit: (hoverValue: any) => void;
  onHoverEnd: () => void;
  onClickInit: (hoverValue: any) => void;
  isTimelineSelected: boolean;
  clickedValue: any;
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  data,
  width,
  xCount,
  onHoverInit,
  onHoverEnd,
  onClickInit,
  clickedValue,
}) => {
  const scale = scaleBand<number>().domain(range(0, xCount)).range([0, width]).padding(0);

  const row = data?.map((d) => (
    <rect
      key={d.xCount}
      onMouseOver={() => onHoverInit(d)}
      onClick={() => onClickInit(d)}
      onMouseLeave={() => onHoverEnd()}
      className="svg-rect"
      height={31}
      style={{
        cursor: 'pointer',
        fill: clickedValue === d.xCount ? '#A4F9C8' : '#b7b7b7',
        pointerEvents: 'all',
        stroke: 'white',
        strokeWidth: '1px',
      }}
      width={scale.bandwidth()}
      x={scale(d.xCount)}
    />
  ));

  return (
    <svg style={{width: window.innerWidth * 0.3, height: 31}} width={window.innerWidth * 0.3} height={31}>
      {row}
    </svg>
  );
};

export default TimelineRow;
