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

export const nodeTypes = ['binding', 'stream', 'update', 'operator'] as const;

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
    const {params: nodeParams} = this.node('operator', id, parent, type);

    // Don't show metadata
    delete rest['metadata'];
    // Refs is always null
    delete rest['refs'];

    if ('update' in rest) {
      nodeParams.update = rest.update.code;
      delete rest['update'];
    }
    if (rest.parent !== undefined) {
      this.edge(rest.parent.$ref, id, 'parent');
      delete rest['parent'];
    }
    // If we have a node for the signal, it was added as a binding
    // in which case, add edge from that
    if (rest.signal !== undefined) {
      if (rest.signal in this.nodes) {
        this.edge(rest.signal, id, 'signal');
      } else {
        nodeParams['signal'] = rest.signal;
      }
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
          nodeParams[k] = JSON.stringify(v);
          continue;
        }
        // otherwise add all that aren't added
        for (const [i, vI] of v.entries()) {
          if (!added.has(i)) {
            nodeParams[`${k}[${i}]`] = JSON.stringify(vI);
          }
        }
        continue;
      }
      if (!this.addOperatorParameter(id, nodeParams, k, v)) {
        nodeParams[k] = JSON.stringify(v);
      }
    }
    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined) {
        continue;
      }
      nodeParams[k] = JSON.stringify(v);
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
    if (typeof v !== 'object') {
      return false;
    }
    if (v === null) {
      return false;
    }
    if ('$ref' in v) {
      this.edge(v.$ref, id, k);
    } else if ('$subflow' in v) {
      this.addFlow(v.$subflow, id);
    } else if ('$expr' in v) {
      params['k'] = v.$expr.code;
      for (const [label, {$ref}] of Object.entries(v.$params)) {
        this.edge($ref, id, `${k}.${label}`);
      }
    } else if ('$encode' in v) {
      // Turn an encode into a nested graph, assuming there is only one encode per operation
      // Assumes that the marktype is the same in all stages

      const addedChannels = new Set<string>();
      for (const [stage, {$expr}] of Object.entries(v.$encode)) {
        params[`Encode Mark Type`] = $expr.marktype;

        for (const [channel, {code}] of Object.entries($expr.channels)) {
          const exprID = `${id}-${stage}-${channel}`;
          this.node('operator', exprID, id, code);
          const channelID = `${id}-channel-${channel}`;
          this.edge(exprID, channelID, stage);
          if (!addedChannels.has(channel)) {
            addedChannels.add(channel);
            this.node('operator', channelID, id, channel);
          }
        }
      }
    } else {
      return false;
    }
    return true;
  }

  private addUpdate({source, target, update, options}: Update, index: number, parent?: ID): void {
    // ID updates by index
    const id = `update-${parent || 'root'}.${index}`;
    const node = this.node('update', id, parent);
    if (options?.force) {
      node.params.force = 'true';
    }
    if (update && typeof update === 'object' && '$expr' in update) {
      node.label = update.$expr.code;
      for (const [k, v] of Object.entries(update.$params ?? {})) {
        this.edge(v.$ref, id, k);
      }
    } else {
      node.label = JSON.stringify(update);
    }
    this.edge(typeof source === 'object' ? source.$ref : source, id);
    this.edge(id, target);
  }
  private addBinding({signal, ...rest}: Binding) {
    this.node(
      'binding',
      signal,
      undefined,
      signal,
      Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, JSON.stringify(v)]))
    );
  }

  private addStream(stream: Stream, parent?: ID) {
    const node = this.node('stream', stream.id, parent);

    if ('stream' in stream) {
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

      this.edge(before, stream.id, 'after', 'light');
      this.edge(after, stream.id, 'before', 'light');
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
      node.params.filter = stream.filter.code;
    }
  }
  private edge(source: ID, target: ID, label?: string, style?: Edge['style']) {
    this.edges.push({source, target, label, style});
  }
  private node(type: Node['type'], id: ID, parent?: ID, label?: string, params?: Node['params']): Node {
    if (id in this.nodes) {
      throw new Error(`Cannot create node with duplicate ID: ${id}`);
    }
    return (this.nodes[id] = {type, params: params ?? {}, label, parent});
  }
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
  style?: 'light' | 'dark';
};
