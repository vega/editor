import {Graph} from './graph';

export type Elements = {nodes: string[]; edges: string[]};

/**
 * Returns all related nodes to the passed in nodes and edges. This includes all ancestor parents and children.
 *
 * It treats compound relationships as both parents and children.
 */
export function allRelated({nodes, edges}: Graph, selected: Elements): Set<string> {
  return new Set(
    (['up', 'down'] as const).flatMap((direction) => {
      // Map from ID to node
      const fromEdges = selected.edges.map((id) => {
        const {source, target} = edges[id];
        return direction === 'up' ? source : target;
      });

      const toProcess = new Set<string>([...selected.nodes, ...fromEdges]);
      const processed = new Set<string>();
      // Pop off node and all it's parents
      while (toProcess.size > 0) {
        const id = pop(toProcess);
        processed.add(id);

        // Mark the compound node relations as visited
        // and add their immediate parents to the queue
        const node = nodes[id];
        const parents = node.parent !== undefined ? [node.parent] : [];
        const relatedCompound = [...parents, ...node.children];
        relatedCompound.forEach((i) => processed.add(i));
        for (const relatedID of [...relatedCompound, id].flatMap((i) =>
          direction === 'up' ? nodes[i].incoming : nodes[i].outgoing
        )) {
          if (processed.has(relatedID)) {
            continue;
          }
          toProcess.add(relatedID);
        }
      }
      return [...processed];
    })
  );
}

/**
 * Pops the first value from the set, throwing an error if it's empty.
 */
function pop<K>(m: Set<K>): K {
  const {done, value} = m[Symbol.iterator]().next();
  if (done) {
    throw new Error('Cannot pop from empty set');
  }
  m.delete(value);
  return value;
}
