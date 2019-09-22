import { Bounds, SceneContext } from 'vega';

export interface SceneGraphNode {
  bounds: Bounds;
  clip: boolean;
  dirty: number;
  group: undefined;
  interactive: boolean;
  items: SceneGraphGroupItem[];
  marktype: 'group';
  name: string;
  role: string;
  /**
   * The source node in the data flow graph.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
  zindex: number;
  /**
   * The underlying SVG element.
   */
  _svg?: SVGElement;
}

export interface SceneGraphGroupItem extends SceneGraphNode {
  context: SceneContext;
}

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
  '_svg',
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
  if (Array.isArray(t.items)) {
    obj.items = t.items.map(exportScene);
  }
  return obj;
}
