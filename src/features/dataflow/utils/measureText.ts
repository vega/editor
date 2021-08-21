import {fontSize, fontFamily} from './cytoscapeStyle';
const ctx = document.createElement('canvas').getContext('2d');

ctx.font = `${fontSize} ${fontFamily}`;

export type Size = {width: number; height: number};

export function measureText(label: string): Size {
  const metrics = ctx.measureText(label);
  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  };
}
