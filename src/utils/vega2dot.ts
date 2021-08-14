import {Runtime} from 'vega-typings';
import {
  Binding,
  BuiltinParameter,
  ID,
  ObjectOrAny,
  Operator,
  Parameter,
  Stream,
  Subflow,
  Update,
} from 'vega-typings/types/runtime/runtime';

import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/parser-babel';
// The `semantic` type is not an actual value in the dataflow, but we use them to show the semantic dependecies
// from the actual view
export const nodeTypes = ['binding', 'stream', 'update', 'operator', 'semantic'] as const;

export class Graph {
  // Mapping from graph ID to node
  nodes: Record<ID, Node> = {};
  edges: Edge[] = [];

  constructor(dataflow: Runtime) {
    dataflow.bindings.forEach(this.addBinding.bind(this));
    this.addFlow(dataflow);
  }

  private addFlow({streams, operators, updates}: Subflow, parent?: ID): void {
    streams.forEach((s) => this.addStream(s, parent));
    operators.forEach((o) => this.addOperator(o, parent));
    updates.forEach((u, i) => this.addUpdate(u, i, parent));
  }

  private addOperator({id, type, params, ...rest}: Operator, parent?: ID): void {
    const {params: nodeParams} = this.node({
      type: 'operator',
      id,
      parent,
      label: type,
      params: {type: 'operator', ID: id.toString()},
      relatedIDs: [id],
    });
    // Don't show metadata
    delete rest['metadata'];
    // Refs is always null
    delete rest['refs'];

    if ('update' in rest) {
      nodeParams.update = prettifyExpression(rest.update.code);
      delete rest['update'];
    }
    if (rest.parent !== undefined) {
      const parentID = rest.parent.$ref;
      this.edge({source: parentID, target: id});
      delete rest['parent'];
    }
    // Handle data seperately to show in graph as nodes

    if (rest.data !== undefined) {
      for (const [name, dataset] of Object.entries(rest.data)) {
        const datasetNodeID = `data.${parent ?? 'root'}.${name}`;
        if (datasetNodeID in this.nodes) {
          this.nodes[datasetNodeID].relatedIDs.add(id);
        } else {
          this.node({
            type: 'semantic',
            id: datasetNodeID,
            parent,
            label: name,
            params: {type: 'dataset', dataset: name},
            relatedIDs: [id],
          });
        }
        for (const stage of new Set(dataset)) {
          const datasetStageNodeID = `${datasetNodeID}.${stage}`;
          this.node({
            type: 'semantic',
            id: datasetStageNodeID,
            parent: datasetNodeID,
            label: stage,
            relatedIDs: [id],
            params: {
              dataset: name,
              stage: stage,
            },
          });
          this.edge({source: datasetStageNodeID, target: id});
        }
      }
      delete rest['data'];
    }
    // If we have a node for the signal, it was added as a binding
    // in which case, add edge from that
    if (rest.signal !== undefined) {
      const signal = rest.signal;
      if (signal in this.nodes) {
        this.nodes[signal].relatedIDs.add(id);
        this.edge({source: signal, target: id, label: 'signal'});
      }
      nodeParams['signal'] = signal;
      delete rest['signal'];
    }
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v === undefined) {
        continue;
      }
      // We have to check to see if the parameter values is a either a regular JSON value,
      // or a special case parameter, or a list of values/special case parameters.
      if (Array.isArray(v)) {
        const added = new Set<number>();
        for (const [i, vI] of v.entries()) {
          if (this.addOperatorParameter(id, nodeParams, `${k}[${i}]`, vI)) {
            added.add(i);
          }
        }
        // If we didn't add any operators, then add them all as one array
        if (added.size === 0) {
          nodeParams[k] = prettifyJSON(v);
          continue;
        }
        // otherwise add all that aren't added
        for (const [i, vI] of v.entries()) {
          if (!added.has(i)) {
            nodeParams[`${k}[${i}]`] = prettifyJSON(vI);
          }
        }
        continue;
      }
      if (!this.addOperatorParameter(id, nodeParams, k, v)) {
        nodeParams[k] = prettifyJSON(v);
      }
    }
    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined) {
        continue;
      }
      nodeParams[k] = prettifyJSON(v);
    }
  }

  /**
   * Adds a parameter, returning whether it was added or not.
   */
  private addOperatorParameter(
    id: ID,
    params: Node['params'],
    k: string,
    v: Parameter | ObjectOrAny<BuiltinParameter>
  ): boolean {
    // Hide null parent params
    if (k === 'parent' && v === null) {
      return true;
    }
    if (typeof v !== 'object') {
      return false;
    }
    if (v === null) {
      return false;
    }
    if ('$ref' in v) {
      const vID = v.$ref;
      const pulse = k === 'pulse';
      const label = pulse ? undefined : k;
      this.edge({source: vID, target: id, label, pulse});
      return true;
    }
    if ('$subflow' in v) {
      this.addFlow(v.$subflow, id);
      // Add edge to first node, which is root node and is used to detach the subflow
      const rootID = v.$subflow.operators[0].id;
      this.edge({source: id, target: rootID, label: 'root'});
      return true;
    }
    if ('$expr' in v) {
      params[k] = prettifyExpression(v.$expr.code);
      for (const [label, {$ref}] of Object.entries(v.$params)) {
        this.edge({source: $ref, target: id, label: `${k}.${label}`});
      }
      return true;
    }
    if ('$encode' in v) {
      for (const [stage, {$expr}] of Object.entries(v.$encode)) {
        // Assumes that the marktype is the same in all stages
        params[`encode marktype`] = $expr.marktype;
        // Add each stage as a param, mapping each channel to its value
        params[`encode:${stage}`] = Object.entries($expr.channels)
          .map(([channel, {code}]) => `${channel}: ${prettifyExpression(code)}`)
          .join('\n');
      }
      return true;
    }
    return false;
  }

  private addUpdate({source, target, update, options}: Update, index: number, parent?: ID): void {
    // ID updates by index
    const id = `update-${parent || 'root'}.${index}`;
    const node = this.node({type: 'update', id: id, parent, label: 'update', params: {type: 'update'}});
    if (options?.force) {
      node.params.force = 'true';
    }
    if (update && typeof update === 'object' && '$expr' in update) {
      node.params['value'] = prettifyExpression(update.$expr.code);
      for (const [k, v] of Object.entries(update.$params ?? {})) {
        const paramID = v.$ref;
        node.relatedIDs.add(paramID);
        this.edge({source: paramID, target: id, label: k});
      }
    } else {
      node.params['value'] = prettifyJSON(update);
    }
    const sourceID = typeof source === 'object' ? source.$ref : source;
    node.relatedIDs.add(sourceID);
    node.relatedIDs.add(target);
    this.edge({source: sourceID, target: id});
    this.edge({source: id, target});
  }
  private addBinding({signal, ...rest}: Binding) {
    this.node({
      type: 'binding',
      id: signal,
      label: signal,
      params: {
        type: 'binding',
        ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, prettifyJSON(v)])),
      },
    });
  }

  private addStream(stream: Stream, parent?: ID) {
    const node = this.node({
      type: 'stream',
      id: stream.id,
      parent,
      params: {type: 'stream', ID: stream.id.toString()},
      relatedIDs: [stream.id],
    });

    if ('stream' in stream) {
      node.label = 'stream';
      this.edge({source: stream.stream, target: stream.id});
    } else if ('merge' in stream) {
      node.label = 'merge';
      stream.merge.forEach((from) => {
        this.edge({source: from, target: stream.id});
      });
    } else {
      node.label = `${stream.source}:${stream.type}`;
    }
    if ('between' in stream) {
      const [before, after] = stream.between;

      this.edge({source: before, target: stream.id, label: 'before'});
      this.edge({source: stream.id, target: after, label: 'after'});
    }
    if (stream.consume) {
      node.params.consume = 'true';
    }
    if (stream.debounce) {
      node.params.debounce = stream.debounce.toString();
    }
    if (stream.throttle) {
      node.params.throttle = stream.throttle.toString();
    }
    if (stream.filter) {
      node.params.filter = prettifyExpression(stream.filter.code);
    }
  }
  private edge({source, target, label, pulse}: {source: ID; target: ID; label?: string; pulse?: boolean}) {
    this.edges.push({source, target, label, pulse: pulse || false});
  }
  private node({
    type,
    id,
    parent,
    label,
    params,
    relatedIDs,
  }: {
    type: Node['type'];
    id: ID;
    parent?: ID;
    label?: string;
    params?: Node['params'];
    relatedIDs?: ID[];
  }): Node {
    if (id in this.nodes) {
      throw new Error(`Cannot create node with duplicate ID: ${id}`);
    }
    return (this.nodes[id] = {type, params: params ?? {}, label, parent, relatedIDs: new Set(relatedIDs || [])});
  }
}

/**
 * Prettify a JSON value as Javascript literal.
 */
function prettifyJSON(value: unknown): string {
  return prettifyExpression(JSON.stringify(value));
}

/**
 * Prettify a JS expression, by creating a statement out of it, then removing the variable decleration and trailing semi-colon.
 **/
function prettifyExpression(expression: string): string {
  return prettier.format(`i = ${expression}`, {parser: 'babel', printWidth: 60, plugins: [parserBabel]}).slice(4, -2);
}

export type Node = {
  type: typeof nodeTypes[number];
  parent?: ID;
  // Optional label for node
  label?: string;
  // Optional params to display
  params: Record<string, string>;
  // Set of node IDs this node is created by, to be usef when filtering nodes by ID
  relatedIDs: Set<ID>;
};

type Edge = {
  source: ID;
  target: ID;
  // Optional label to display
  label?: string;
  pulse: boolean;
};
