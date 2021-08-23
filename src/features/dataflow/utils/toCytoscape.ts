import cytoscape from 'cytoscape';
import {ElkNode} from 'elkjs';
import {Graph} from './graph';
import {mapValues} from './mapValues';

/**
 * Creates a cytoscape definition from a graph and a layout
 */
export function toCytoscape(graph: Graph, layout: ElkNode): cytoscape.ElementsDefinition {
  // Keep a mapping of all IDs so we can add their position when traversing the ELK graph
  const IDToNode = mapValues(
    graph.nodes,
    ({parent, label, colorKey, size}, id) =>
      ({data: {id, parent, label, colorKey, ...size}} as cytoscape.NodeDefinition)
  );

  // Convert from ELK's position, which is relative to the parent and for the top left corner,
  // to cytoscape's which is absolute and in the center of the node
  // https://github.com/cytoscape/cytoscape.js-elk/blob/ce1f11d8d9d472d92148f6ec101e69b40268c8b9/src/layout.js#L17-L26
  traverseELKNodes(layout, (id, {parentX, parentY, x, y}) => {
    IDToNode[id].position = {
      x: parentX + x / 2,
      y: parentY + y / 2,
    };
  });

  const edges = Object.entries(graph.edges).map(
    ([id, {label, source, target, primary}]) =>
      ({
        data: {
          id,
          label,
          source,
          target,
          primary,
        },
      } as cytoscape.EdgeDefinition)
  );
  return {nodes: Object.values(IDToNode), edges};
}

/**
 * Traverses all nodes, besides the root, and calls the callback with its position, parent positions, and ID.
 */
function traverseELKNodes(
  layout: ElkNode,
  callback: (id: string, position: {parentX: number; parentY: number; x: number; y: number}) => void
) {
  const toProcess = (layout?.children || []).map((n) => ({node: n, parentX: 0, parentY: 0}));
  while (toProcess.length) {
    const {node, parentX, parentY} = toProcess.pop();
    const {x, y} = node;
    callback(node.id, {parentX, parentY, x, y});
    node.children.forEach((n) => toProcess.push({node: n, parentX: parentX + x, parentY: parentY + y}));
  }
}
