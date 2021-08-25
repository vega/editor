/**
 * Denormalized graph represenation, that provides efficient filtering
 */

import {vega} from 'vega-embed';
import {Size} from './measureText';

type ID = string;

export const types = {
  binding: {label: 'Bindings'},
  stream: {label: 'Streams'},
  update: {label: 'Updates'},
  operator: {label: 'Operators'},
  data: {label: 'Data'},
  signal: {label: 'Signals'},
};

// Nodes are keyed by their type, apart from operator nodes, which are sub-keyed by their name
// We used a list of the registered operators to generate the keys, so they are consistant accross graphs
export const colorKeys = [...Object.keys(types), ...Object.keys(vega.transforms).map((t) => `operator:${t}`)] as const;

export type Node = {
  // The type of the node, to use for filtering
  // Should always be present by the end of graph construction
  type?: keyof typeof types;
  // A short label describing the node
  // Should always be present by the end of graph construction
  label?: string;
  // A parent node, if this node is inside a compound node
  parent?: ID;
  // A string that can be used to identify the node for coloring
  // should always be present
  colorKey?: typeof colorKeys[number];
  // Mapping of keys to values, for display
  params: Record<string, string>;

  // Lower partition are laid out closer to the begining of the graph
  // https://www.eclipse.org/elk/reference/options/org-eclipse-elk-partitioning-partition.html
  partition?: number;
  // Compute node sizes for layout and display based on label text
  // As reccomended by cytoscape https://github.com/cytoscape/cytoscape.js/issues/2713#issuecomment-712247855
  size: Size;

  children: ID[];
  incoming: ID[];
  outgoing: ID[];
  associated: ID[];
};

export type Edge = {
  source: ID;
  target: ID;
  // Optional label to display on the edge
  label?: string;
  size: Size;
  // Whether this is a primary edge, used for pulses, or a secondary edge
  primary: boolean;
};

export type Graph = {
  nodes: Record<ID, Node>;
  edges: Record<ID, Edge>;
};

export function filterGraph(graph: Graph, nodes: Set<ID>): Graph {
  return {
    nodes: Object.fromEntries(Object.entries(graph.nodes).filter(([id]) => nodes.has(id))),
    edges: Object.fromEntries(
      Object.entries(graph.edges).filter(([, {source, target}]) => nodes.has(source) && nodes.has(target))
    ),
  };
}

/**
 * Returns all nodes ID that are associated to the IDs passed in, plus all their parents.
 */
export function associatedWith({nodes}: Graph, ids: string[]): Set<string> {
  const results = new Set<string>();
  for (const [key, node] of Object.entries(nodes)) {
    if (node.associated.some((id) => ids.includes(id))) {
      results.add(key);
      let parent = node.parent;
      while (parent) {
        results.add(parent);
        parent = nodes[parent].parent;
      }
    }
  }
  return results;
}

/**
 * Returns the intersection of the passed in IDs, or null if all are null.
 */
export function intersectIDs(...listIDS: Array<Set<string> | null>): Set<string> | null {
  const nonNull = listIDS.filter((ids) => ids !== null);
  switch (nonNull.length) {
    case 0:
      return null;
    case 1:
      return nonNull[0];
  }
  // Iterate through each item in first, only including it if in all the other sets
  const [first, ...rest] = nonNull;
  return new Set([...first].filter((id) => rest.every((ids) => ids.has(id))));
}
