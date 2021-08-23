import {ElkNode, LayoutOptions} from 'elkjs';
import {Graph} from './graph';

// We do our own layouts with ELK instead of using the cytoscape ELK plugin, so we can cache the layouts more easily
// https://github.com/cytoscape/cytoscape.js-elk/blob/master/src/layout.js

const LAYOUT_OPTIONS: LayoutOptions = {
  algorithm: 'layered',
  'org.eclipse.elk.direction': 'RIGHT',
  // Make layouts more compact
  'org.eclipse.elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',

  // Require to layout childrenhttps://github.com/kieler/elkjs/issues/44#issuecomment-412283358
  'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',

  // Sometimes seems to improve layouts
  'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',

  // Disable temporarily, becuase it sometimes crashes ELK
  // Add partitioning to move signal and bindings to top
  // 'org.eclipse.elk.partitioning.activate': 'true',

  // We are placing the labels directly on the edges
  'org.eclipse.elk.edgeLabels.inline': 'true',

  // 'org.eclipse.elk.padding': '10',

  // 'org.eclipse.elk.spacing.edgeNode': '20',

  'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': '30',
};

const ROOT_ID = 'ELK:root';

export function toELKGraph(graph: Graph): ElkNode {
  // ELK requires that children nodes be nested inside their parents, in the graph JSON.
  // Therefore, we keep track of every node we add, so that when we add a node, to we add it to its parent
  const idToNode: Map<string, ElkNode> = new Map();

  const edges = Object.entries(graph.edges).map(([id, {source, target, size, label}]) => ({
    id,
    source,
    target,
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
    const node = getOrCreateNode(id);
    node.layoutOptions = {
      'org.eclipse.elk.partitioning.partition': partition.toString(),
    };
    Object.assign(node, size);
    getOrCreateNode(parent ?? ROOT_ID).children.push(node);
  }

  return rootNode;
}
