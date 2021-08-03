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
    const {params: nodeParams} = this.node('operator', id, parent, type, {type: 'operator', ID: id.toString()});
    // Don't show metadata
    delete rest['metadata'];
    // Refs is always null
    delete rest['refs'];

    if ('update' in rest) {
      nodeParams.update = prettifyExpression(rest.update.code);
      delete rest['update'];
    }
    if (rest.parent !== undefined) {
      this.edge(rest.parent.$ref, id, 'parent');
      delete rest['parent'];
    }
    // If we have a node for the signal, it was added as a binding
    // in which case, add edge from that
    if (rest.signal !== undefined) {
      const signal = rest.signal;
      if (signal in this.nodes) {
        this.edge(signal, id, 'signal');
      }
      nodeParams['signal'] = signal;
      delete rest['signal'];
    }
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v === undefined) {
        continue;
      }
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
   * Adds a parameter, returning whether it was added or not
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
      const pulse = k === 'pulse';
      this.edge(v.$ref, id, pulse ? undefined : k, pulse);
    } else if ('$subflow' in v) {
      this.addFlow(v.$subflow, id);
      // Add edge to first node, which is root node and is used to detach the subflow
      this.edge(id, v.$subflow.operators[0].id, 'root');
    } else if ('$expr' in v) {
      params['k'] = prettifyExpression(v.$expr.code);
      for (const [label, {$ref}] of Object.entries(v.$params)) {
        this.edge($ref, id, `${k}.${label}`);
      }
    } else if ('$encode' in v) {
      for (const [stage, {$expr}] of Object.entries(v.$encode)) {
        // Assumes that the marktype is the same in all stages
        params[`encode marktype`] = $expr.marktype;
        // Add each stage as a param, mapping each channel to its value
        params[`encode:${stage}`] = Object.entries($expr.channels)
          .map(([channel, {code}]) => `${channel}: ${prettifyExpression(code)}`)
          .join('\n');
      }
    } else {
      return false;
    }
    return true;
  }

  private addUpdate({source, target, update, options}: Update, index: number, parent?: ID): void {
    // ID updates by index
    const id = `update-${parent || 'root'}.${index}`;
    const node = this.node('update', id, parent, 'update', {type: 'update'});
    if (options?.force) {
      node.params.force = 'true';
    }
    if (update && typeof update === 'object' && '$expr' in update) {
      node.params['value'] = prettifyExpression(update.$expr.code);
      for (const [k, v] of Object.entries(update.$params ?? {})) {
        // If arg was from the target node itself, don't include it to break cycles
        if (v.$ref === target) {
          continue;
        }
        this.edge(v.$ref, id, k);
      }
    } else {
      node.params['value'] = prettifyJSON(update);
    }
    this.edge(typeof source === 'object' ? source.$ref : source, id);
    this.edge(id, target);
  }
  private addBinding({signal, ...rest}: Binding) {
    this.node('binding', signal, undefined, signal, {
      type: 'binding',
      ...Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, prettifyJSON(v)])),
    });
  }

  private addStream(stream: Stream, parent?: ID) {
    const node = this.node('stream', stream.id, parent, undefined, {type: 'stream', ID: stream.id.toString()});

    if ('stream' in stream) {
      node.label = 'stream';
      this.edge(stream.stream, stream.id);
    } else if ('merge' in stream) {
      node.label = 'merge';
      stream.merge.forEach((from) => {
        this.edge(from, stream.id);
      });
    } else {
      node.label = `${stream.source}:${stream.type}`;
    }
    if ('between' in stream) {
      const [before, after] = stream.between;

      this.edge(before, stream.id, 'after');
      this.edge(after, stream.id, 'before');
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
  private edge(source: ID, target: ID, label?: string, pulse?: boolean) {
    this.edges.push({source, target, label, pulse: pulse || false});
  }
  private node(type: Node['type'], id: ID, parent?: ID, label?: string, params?: Node['params']): Node {
    if (id in this.nodes) {
      throw new Error(`Cannot create node with duplicate ID: ${id}`);
    }
    return (this.nodes[id] = {type, params: params ?? {}, label, parent});
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
};

type Edge = {
  source: ID;
  target: ID;
  // Optional label to display
  label?: string;
  pulse: boolean;
};
