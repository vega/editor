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

export function pull(root: any): SceneGraphNode {
  return {
    bounds: root.bounds,
    clip: root.clip,
    dirty: root.dirty,
    group: undefined,
    interactive: root.interactive,
    items: [],
    marktype: root.marktype,
    name: root.name,
    role: root.role,
    source: {},
    zindex: root.zindex,
  };
}
