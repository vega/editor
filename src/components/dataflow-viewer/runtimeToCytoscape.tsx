import {ElementsDefinition} from 'cytoscape';
import {Runtime} from 'vega';
import {Graph} from '../../utils/vega2dot';

export default function runtimeToCytoscape(runtime: Runtime): ElementsDefinition {
  const g = new Graph(runtime);
  return {
    nodes: Object.entries(g.nodes).map(([id, n]) => ({
      data: {
        id,
        // Add append operator type to use for coloring
        type: n.type === 'operator' && n.label !== 'operator' ? `operator:${n.label}` : n.type,
        parent: n.parent?.toString(),
        params: n.params,
        relatedIDs: [...n.relatedIDs].map((i) => i.toString()),
        layoutOptions: {
          //   // Move bindings and streams to the top
          'org.eclipse.elk.partitioning.partition': n.type === 'binding' ? 0 : n.type === 'stream' ? 1 : 2,
        },
      },
      style: {
        // Set label in style instead of based on data to work around
        // https://github.com/cytoscape/cytoscape.js/issues/2888
        label: n.label,
      },
    })),
    edges: g.edges.map((e, i) => ({
      data: {
        label: e.label,
        id: `edge:${i}`,
        source: e.source.toString(),
        target: e.target.toString(),
        pulse: (e.pulse || false).toString(),
      },
    })),
  };
}
