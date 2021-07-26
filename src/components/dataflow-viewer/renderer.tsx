import cytoscape, {
  CollectionReturnValue,
  EdgeCollection,
  ElementsDefinition,
  NodeCollection,
  NodeSingular,
} from 'cytoscape';
import elk from 'cytoscape-elk';
import popper from 'cytoscape-popper';
import * as React from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';
import {Runtime} from 'vega';
import {vega} from 'vega-embed';
import {scheme} from 'vega-scale';
import {mapStateToProps} from '.';
import {Graph, nodeTypes} from '../../utils/vega2dot';
import './index.css';

cytoscape.use(popper);
cytoscape.use(elk);

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

// A dummy element must be passed as tippy only accepts dom element(s) as the target
// https://atomiks.github.io/tippyjs/v6/constructor/#target-types
const dummyDomEle = document.createElement('div');

function DataflowViewerInternal({runtime}: StoreProps) {
  const elements = React.useMemo(() => runtimeToCytoscape(runtime), [runtime]);
  const divRef = React.useRef<HTMLDivElement | null>(null);
  const cyRef = React.useRef<cytoscape.Core | null>(null);
  // The nodes we have removed for filtering, which we can re-add when we are done
  const removedNodesRef = React.useRef<cytoscape.NodeCollection | null>(null);

  // Instantiate cytoscape
  React.useEffect(() => {
    if (divRef.current === null) {
      return;
    }
    const cy = cytoscape({
      container: divRef.current,
      style,
    });
    cyRef.current = cy;
    triggerPopups(cy);
    triggerFiltering(cy, removedNodesRef);
    return () => cyRef.current.destroy();
  }, [divRef.current]);

  // Update the elements when the graph changes
  React.useEffect(() => {
    if (cyRef.current === null) {
      return;
    }
    const cy = cyRef.current;
    removedNodesRef.current = null;
    cy.batch(() => {
      cy.elements().remove();
      cy.add(elements);
    });
    layoutAndFit(cy);
  }, [cyRef.current, elements]);
  return <div className="dataflow-pane" ref={divRef} />;
}

/**
 * Filters the nodes on the graph to the nodes that are related to the selected nodes.
 **/
function triggerFiltering(cy: cytoscape.Core, removedNodesRef: React.MutableRefObject<NodeCollection | null>): void {
  const restore = () => {
    if (removedNodesRef.current) {
      removedNodesRef.current.restore();
      removedNodesRef.current = null;
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

      removedNodesRef.current = relatedNodes.absoluteComplement();
      removedNodesRef.current.remove();
    });
    layoutAndFit(cy);
  });
  // On unselect, show all nodes and refit
  cy.on('unselect', () => {
    restore();
    layoutAndFit(cy);
  });
}

/**
 * Show details on hover using tippy and popper
 * https://atomiks.github.io/tippyjs/v6/addons/#singleton
 * https://stackoverflow.com/a/54556015/907060
 * https://github.com/cytoscape/cytoscape.js-popper#usage-with-tippyjs
 **/
function triggerPopups(cy: cytoscape.Core): void {
  cy.on('mouseover', ({target}) => {
    if (!('isNode' in target) || !target.isNode()) {
      return;
    }
    const t = (target.tippy = tippy(dummyDomEle, {
      getReferenceClientRect: (target as any).popperRef().getBoundingClientRect,
      content: `<dl><dt>ID</dt><dd>${target.id()}</dd>${Object.entries(target.data().params)
        .map(([k, v]) => `<dt>${k}</dt><dd><pre><code>${v}</code></pre></dd>`)
        .join('')}</dl>`,
      trigger: 'manual',
      placement: 'left',
      arrow: true,
      theme: 'light-border',
      allowHTML: true,
      maxWidth: 550,
      interactive: true,
      // Needed for interactive
      // https://stackoverflow.com/a/63270536/907060
      appendTo: document.body,
    }));
    t.show();
  });
  cy.on('mouseout', ({target}) => {
    if (!('tippy' in target)) {
      return;
    }
    target.tippy.destroy();
    delete target.tippy;
  });
}

/**
 * Run the layout and fit the graph to the window when it finishes
 **/
async function layoutAndFit(cy: cytoscape.Core) {
  await cy.layout(layout).run().promiseOn('layoutstop');
  cy.fit();
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
        params: n.params,
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
