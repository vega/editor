import cytoscape, {CollectionReturnValue, NodeSingular} from 'cytoscape';

/**
 * Returns all related nodes to the selected nodes and edges. This includes all ancestor parents and children.
 *
 * It treats compound relationships as both parents and children.
 */
export default function allRelated(cy: cytoscape.Core): CollectionReturnValue {
  const nodes = cy.elements('node:selected');
  const edges = cy.elements('edge:selected');

  const relatedNodes = (['up', 'down'] as const).flatMap(
    (direction): Array<NodeSingular> => {
      // Map from ID to node
      const fromEdges = direction === 'up' ? edges.sources() : edges.targets();

      const toProcess = new Map<string, NodeSingular>(nodes.add(fromEdges).map((n: NodeSingular) => [n.id(), n]));
      const processed = new Map<string, NodeSingular>();
      // Pop off node and all it's parents
      while (toProcess.size > 0) {
        const [id, node] = pop(toProcess);
        processed.set(id, node);

        // Mark the compound node relations as visited
        // and add their immediate parents to the queue
        const relatedCompound = node.parents().add(node.children());
        relatedCompound.forEach((n) => {
          processed.set(n.id(), n);
        });
        const currentNodes = relatedCompound.add(node);
        (direction === 'up' ? currentNodes.incomers() : currentNodes.outgoers()).forEach((n) => {
          // Don't add edges, just nodes
          if (!n.isNode()) {
            return;
          }
          if (processed.has(n.id())) {
            return;
          }
          toProcess.set(n.id(), n);
        });
      }
      return [...processed.values()];
    }
  );
  return cy.collection(relatedNodes);
}

/**
 * Pops the first value from the map, throwing an error if it's empty.
 */
export function pop<K, V>(m: Map<K, V>): [K, V] {
  const {done, value} = m[Symbol.iterator]().next();
  if (done) {
    throw new Error('Cannot pop from empty map');
  }
  m.delete(value[0]);
  return value;
}
