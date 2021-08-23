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
  traverseELKNodes(layout, (id, {x, y}) => {
    const node = IDToNode[id];
    node.position = {
      x: x + node.data.width / 2,
      y: y + node.data.height / 2,
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
 * Traverses all nodes, besides the root, and calls the callback with its absolute position,  and ID.
 */
function traverseELKNodes(layout: ElkNode, callback: (id: string, position: {x: number; y: number}) => void) {
  const toProcess = (layout?.children || []).map((n) => [n, {x: 0 as number, y: 0 as number}] as const);
  while (toProcess.length) {
    const [node, origin] = toProcess.pop();
    const position = {x: node.x + origin.x, y: node.y + origin.y};
    callback(node.id, position);
    node.children.forEach((n) => toProcess.push([n, position]));
  }
}
