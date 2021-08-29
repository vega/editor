import {Graph} from './graph';

export function toCytoscape(graph: Graph): cytoscape.ElementsDefinition {
  // Keep a mapping of all IDs so we can add their position when traversing the ELK graph
  const nodes = Object.entries(graph.nodes).map(([id, {parent, label, colorKey, size}]) => ({
    data: {id, parent, label, colorKey, ...size},
  }));

  const edges = Object.entries(graph.edges).map(([id, {source, target, primary}]) => ({
    data: {
      id,
      source,
      target,
      primary: primary.toString(),
    },
  }));
  return {nodes, edges};
}
