const keys = [
  'marktype',
  'name',
  'role',
  'interactive',
  'clip',
  'items',
  'zindex',
  'x',
  'y',
  'width',
  'height',
  'align',
  'baseline', // layout
  'fill',
  'fillOpacity',
  'opacity', // fill
  'stroke',
  'strokeOpacity',
  'strokeWidth',
  'strokeCap', // stroke
  'strokeDash',
  'strokeDashOffset', // stroke dash
  'startAngle',
  'endAngle',
  'innerRadius',
  'outerRadius', // arc
  'cornerRadius',
  'padAngle', // arc, rect
  'interpolate',
  'tension',
  'orient',
  'defined', // area, line
  'url', // image
  'path', // path
  'x2',
  'y2', // rule
  'size',
  'shape', // symbol
  'text',
  'angle',
  'theta',
  'radius',
  'dx',
  'dy', // text
  'font',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontVariant', // font
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportScene(t: any): { [key: string]: any } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: { [key: string]: any } = {};
  for (const k of keys) {
    if (k === 'items') {
      continue;
    }
    if (t[k] !== undefined) {
      obj[k] = t[k];
    }
  }
  if (typeof t._svg === 'object' && t.souce !== null) {
    Object.defineProperty(obj, '_svg', { value: t._svg, enumerable: false });
  }
  if (typeof t.source === 'object' && t.souce !== null) {
    Object.defineProperty(obj, 'source', { value: t.source.id, enumerable: false });
  }
  if (Array.isArray(t.items)) {
    obj.items = t.items.map(exportScene);
  }
  return obj;
}
