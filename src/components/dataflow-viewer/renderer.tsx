import {CollectionReturnValue, EdgeCollection, ElementsDefinition, NodeCollection, NodeSingular} from 'cytoscape';
import * as React from 'react';
import {Runtime} from 'vega';
import {mapStateToProps} from '.';
import {Graph, nodeTypes} from '../../utils/vega2dot';
import './index.css';
import cytoscape from 'cytoscape';
import elk from 'cytoscape-elk';
import Cytoscape from 'react-cytoscapejs';
import {scheme} from 'vega-scale';
import dagre from 'cytoscape-dagre';
import {vega} from 'vega-embed';

cytoscape.use(elk);
cytoscape.use(dagre);

type StoreProps = ReturnType<typeof mapStateToProps>;

// Wrap the component so we can catch the errors. We don't use the previously defined
// error boundary component, since we want to seperate errors in graph generation from
// errors in spec rendering
export default class DataflowViewer extends React.Component<
  StoreProps,
  {
    error: Error | null;
  }
> {
  state = {
    error: null,
  };
  public componentDidCatch(error: Error) {
    this.setState({error});
  }

  public render() {
    if (this.state.error) {
      return <div id="error-indicator">{this.state.error.message}</div>;
    }
    return <DataflowViewerInternal {...this.props} />;
  }
}

// https://vega.github.io/vega/docs/schemes/#categorical
const colorScheme: string[] = [...scheme('tableau20'), ...scheme('category20b')];

const style: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      // Labels
      'text-wrap': 'wrap',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': 'white',
      'background-opacity': 0.8,
      shape: 'rectangle',
      width: 'label',
      height: 'label',
    } as any,
  },
  {
    selector: ':parent',
    style: {
      'text-valign': 'top',
    },
  },
  {
    selector: ':selected',
    style: {
      'overlay-opacity': 0.2,
    },
  },
  {
    selector: 'node.around-selected',
    style: {
      'overlay-opacity': 0.1,
    },
  },
  {
    selector: 'edge',
    css: {
      'target-arrow-shape': 'vee',
      'curve-style': 'straight',
      'text-outline-width': 5,
      'text-outline-color': 'white',
      width: 1,
      'text-rotation': 'autorotate',
    },
  },
  {
    selector: 'edge[label]',
    css: {
      label: 'data(label)',
    },
  },
  {
    selector: 'edge[pulse="true"]',
    css: {
      color: 'black',
      'line-color': 'black',
      'target-arrow-color': 'black',
    },
  },
  {
    selector: 'edge[pulse="false"]',
    css: {
      color: '#ddd',
      'line-color': '#ddd',
      'target-arrow-color': '#ddd',
    },
  },
  // Add types for operator types as well as other types
  ...[...nodeTypes, ...Object.keys(vega.transforms).map((t) => `operator:${t}`)].map((t, i) => ({
    selector: `node[type=${JSON.stringify(t)}]`,
    style: {color: colorScheme[i % colorScheme.length]},
  })),
];

// https://github.com/cytoscape/cytoscape.js-elk
const layout = {
  name: 'elk',
  nodeDimensionsIncludeLabels: true,
  fit: true,
  elk: {
    algorithm: 'layered',
    'org.eclipse.elk.direction': 'DOWN',
    'org.eclipse.elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
    // https://github.com/kieler/elkjs/issues/44#issuecomment-412283358
    'org.eclipse.elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    // Seems to give better layouts
    // edgeRouting: 'ORTHOGONAL',
    // 'org.eclipse.elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  },
};

function DataflowViewerInternal({runtime}: StoreProps) {
  const elements = React.useMemo(() => runtimeToCytoscape(runtime), [runtime]);
  const onCytoscape = React.useCallback((cy: cytoscape.Core) => {
    let removed: cytoscape.NodeCollection = null;
    const restore = () => {
      if (removed) {
        removed.restore();
        removed = null;
      }
    };
    // On select, filter nodes to successors and predecessors of selected and re-layout.
    cy.on('select', () => {
      let relatedNodes: cytoscape.NodeCollection;
      cy.batch(() => {
        restore();
        const selectedNodes = cy.elements('node:selected');
        const selectedEdges = cy.elements('edge:selected');

        relatedNodes = allRelated(cy, selectedNodes, selectedEdges);

        removed = relatedNodes.absoluteComplement();
        removed.remove();
      });
      layoutAndFit(cy, relatedNodes);
    });
    // On unselect, show all nodes and refit
    cy.on('unselect', () => {
      restore();
      layoutAndFit(cy, cy.elements());
    });
  }, []);
  return (
    <Cytoscape
      className="dataflow-pane"
      elements={[...elements.nodes, ...elements.edges]}
      stylesheet={style}
      layout={layout}
      cy={onCytoscape}
    />
  );
}

async function layoutAndFit(cy: cytoscape.Core, nodes: cytoscape.NodeCollection) {
  await nodes.layout(layout).run().promiseOn('layoutstop');
  cy.fit(nodes);
}

function runtimeToCytoscape(runtime: Runtime): ElementsDefinition {
  const g = new Graph(runtime);
  return {
    nodes: Object.entries(g.nodes).map(([id, n]) => ({
      data: {
        id,
        // Add operator type to operator type, so we can color by it
        type: n.type === 'operator' && n.label !== 'operator' ? `operator:${n.label}` : n.type,
        parent: n.parent?.toString(),
      },
      style: {
        // Set label in style instead of based on data to work around
        // https://github.com/cytoscape/cytoscape.js/issues/2888
        label:
          // Combine labels with keys and values, with values truncated to reduce node width
          [...[n.label ? [n.label] : []], ...Object.entries(n.params).map(([k, v]) => `${k}: ${truncate(v, 10)}`)].join(
            '\n'
          ) || '...',
      },
    })),
    edges: g.edges.map((e, i) => ({
      data: {
        label: e.label,
        id: `edge:${i}`,
        source: e.source.toString(),
        target: e.target.toString(),
        pulse: e.pulse.toString(),
      },
    })),
  };
}

/**
 * Returns all related nodes to the input nodes and edges. This includes all ancestor parents and children.
 *
 * It treats compound relationships as both parents and children.
 */
function allRelated(cy: cytoscape.Core, nodes: NodeCollection, edges: EdgeCollection): CollectionReturnValue {
  const relatedNodes = (['up', 'down'] as const).flatMap((direction): Array<NodeSingular> => {
    // Map from ID to node
    const toProcess = new Map<string, NodeSingular>(
      nodes.add(direction === 'up' ? edges.sources() : edges.targets()).map((n: NodeSingular) => [n.id(), n])
    );
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
        if (processed.has(n.id())) {
          return;
        }
        toProcess.set(n.id(), n);
      });
    }
    return [...processed.values()];
  });
  return cy.collection(relatedNodes);
}
/**
 * Pops the first value from the map, throwing an error if it's empty.
 */
function pop<K, V>(m: Map<K, V>): [K, V] {
  const {done, value} = m[Symbol.iterator]().next();
  if (done) {
    throw new Error('Cannot pop from empty map');
  }
  m.delete(value[0]);
  return value;
}

function truncate(s: string, max: number) {
  if (s.length > max) {
    return `${s.substring(0, max - 1)}…`;
  }
  return s;
}
