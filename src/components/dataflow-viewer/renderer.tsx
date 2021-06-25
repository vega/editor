import {ElementsDefinition} from 'cytoscape';
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
const colorScheme: string[] = scheme('set1');

const style: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      // Labels
      'text-wrap': 'wrap',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-opacity': 0,
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
  {selector: 'node, edge', css: {'text-outline-width': 5, 'text-outline-color': 'white'}},
  {
    selector: 'edge',
    css: {
      'target-arrow-shape': 'vee',
      'curve-style': 'straight',
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
  ...nodeTypes.map((t, i) => ({
    selector: `node[type=${JSON.stringify(t)}]`,
    style: {color: colorScheme[i]},
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
    // edgeRouting: 'SPLINES',
  },
};
// const layout = {
//   name: 'dagre',
//   nodeDimensionsIncludeLabels: true,
//   fit: true,
// }

function DataflowViewerInternal({runtime}: StoreProps) {
  const elements = React.useMemo(() => runtimeToCytoscape(runtime), [runtime]);

  const onCytoscape = React.useCallback((cy: cytoscape.Core) => {
    let removed;
    cy.on('select', ({target}) => {
      const aroundSelected = target.successors().add(target.predecessors());
      // aroundSelected.addClass('around-selected');
      const allSelected = aroundSelected.add(target);
      const allSelectdAndParents = allSelected.add(allSelected.ancestors());
      removed = allSelectdAndParents.absoluteComplement();
      removed.remove();
      // cy.fit(allSelected);
      const subLayout = allSelectdAndParents.layout(layout);
      subLayout.run();
      subLayout.promiseOn('layoutstop').then(() => allSelectdAndParents.fit());
      // (async () => {
      //   subLayout.run();
      // })();
    });
    cy.on('unselect', () => {
      removed.restore();
      // cy.fit();
      cy.layout(layout)
        .run()
        .promiseOn('layoutstop')
        .then(() => cy.fit());
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

function runtimeToCytoscape(runtime: Runtime): ElementsDefinition {
  const g = new Graph(runtime);
  return {
    nodes: Object.entries(g.nodes).map(([id, n]) => ({
      data: {
        id,
        type: n.type,
        parent: n.parent?.toString(),
      },
      style: {
        // Set label in style instead of based on data to work around
        // https://github.com/cytoscape/cytoscape.js/issues/2888
        label: [...[n.label ? [n.label] : []]].join('\n') || '...',
        // ...Object.entries(n.params).map(([k, v]) => `${k}: ${v}`)ß
      },
    })),
    edges: g.edges.map((e, i) => ({
      data: {label: e.label, id: `edge:${i}`, source: e.source.toString(), target: e.target.toString()},
    })),
  };
}
