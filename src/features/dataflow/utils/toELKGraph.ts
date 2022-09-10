import {ElkNode, LayoutOptions} from 'elkjs';
import {Graph} from './graph';

// We do our own layouts with ELK instead of using the cytoscape ELK plugin, so we can cache the layouts more easily
// https://github.com/cytoscape/cytoscape.js-elk/blob/master/src/layout.js

const LAYOUT_OPTIONS: LayoutOptions = {
  algorithm: 'layered',
  'org.eclipse.elk.direction': 'RIGHT',

  // Disabled because ends up with unaligned layers
  // Make layouts more compact
  // 'org.eclipse.elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',

  // Required to layout children
  // https://github.com/kieler/elkjs/issues/44#issuecomment-412283358
  'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',

  // Sometimes seems to improve layouts
  'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',

  // Disable temporarily, because it sometimes crashes ELK
  // Add partitioning to move signal and bindings to top
  // 'org.eclipse.elk.partitioning.activate': 'true',

  // We are placing the labels directly on the edges
  'org.eclipse.elk.edgeLabels.inline': 'true',

  // Add more spacing overall to make it easier to read
  'org.eclipse.elk.layered.spacing.baseValue': '40',
};

const ROOT_ID = 'ELK:root';

export function toELKGraph(graph: Graph, visible: {nodes: Set<string>; edges: Set<string>} | null): ElkNode {
  // ELK requires that children nodes be nested inside their parents, in the graph JSON.
  // Therefore, we keep track of every node we add, so that when we add a node, to we add it to its parent
  const idToNode: Map<string, ElkNode> = new Map();

  const edges = Object.entries(graph.edges)
    .filter(([id]) => visible?.edges.has(id) ?? true)
    .map(([id, {source, target, size, label}]) => ({
      id,
      sources: [source],
      targets: [target],
      labels: label ? [{id: `edge-label:${id}`, text: label, ...size}] : [],
    }));

  const rootNode: ElkNode = {
    id: ROOT_ID,
    children: [],
    edges: edges,
    layoutOptions: LAYOUT_OPTIONS,
  };
  idToNode.set(ROOT_ID, rootNode);

  // Get a node, or create it, so we can add children to nodes we haven't found yet
  const getOrCreateNode = (id: string): ElkNode => {
    if (!idToNode.has(id)) {
      idToNode.set(id, {
        id,
        children: [],
      });
    }
    return idToNode.get(id);
  };
  // Iterate through the graph, adding nodes to the graph. If the node has a parent, add it to that parent's children instead of the root
  for (const [id, {parent, size, partition}] of Object.entries(graph.nodes)) {
    if (visible && !visible.nodes.has(id)) {
      continue;
    }

    const node = getOrCreateNode(id);
    node.layoutOptions = {
      'org.eclipse.elk.partitioning.partition': partition.toString(),
    };
    Object.assign(node, size);
    getOrCreateNode(parent ?? ROOT_ID).children.push(node);
  }

  return rootNode;
}
